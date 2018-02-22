class Client {

  constructor() {
    console.log("in client constructor");
    this.socket = io('http://localhost:55000');
    this.newPlayer();
    this.allPlayers();
  }

  newPlayer() {
    this.socket.on('newplayer', function(data) {
      addNewPlayer(data.id, data.x, data.y);
    });
  }

  allPlayers() {
    let client = this;
    this.socket.on('allplayers', function(data) {
      for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
      }
      client.move();
      client.remove();
    });
  }

  move() {
    this.socket.on('move', function(data) {
      movePlayer(data.id, data.x, data.y);
    });
  }

  remove() {
    this.socket.on('remove', function(id) {
      removePlayer(id);
    });
  }

  sendTest() {
    console.log("Test Sent");
    this.socket.emit('test');
  }

  askNewPlayer() {
    this.socket.emit('newplayer');
  }

  sendClick(x, y) {
    this.socket.emit('click', {
      x: x,
      y: y
    });
  }

}
