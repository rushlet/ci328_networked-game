class Client {

  constructor() {
    console.log("in client constructor");
    this.ID;
    this.x;
    this.y;
    this.currentKey;
    this.socket = io(location.hostname + ':55000');
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
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
        client.ID = data[i].id;
        client.x = data[i].x;
        client.y = data[i].y;
      }
      client.move();
      client.remove();
    });
  }

  move() {
    this.socket.on('move', function(data, direction) {
      if (client.ID != data.id) {
              console.log('move ', direction);
        movePlayer(data.id, direction, data.x, data.y);
      }
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

  updatePlayerInput(direction, x, y) {
    this.socket.emit('movement', {
      direction: direction,
      x: x,
      y: y
    });
  }

}
