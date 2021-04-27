const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');

server.listen(process.env.PORT || 3000)

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true
})
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer)
peerServer.on('connection', function (client) {
  console.log('user with ', client.id, 'connected');
});
server.on('disconnect', function (client) 
{
  console.log('user with ', client.id, 'disconnected');
});
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    console.log(`socket connected to ${userId}`)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      console.log(`socket disconnected to ${userId}`)
    })
  })
})

