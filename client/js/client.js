class Client {

  constructor() {
    this.ID;
    this.direction;
    this.socket = io(location.hostname + ':55000');
    this.newPlayer();
    this.allPlayers();
  }

  // Client Socket On Functions
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
        client.ID = data[i].id;
      }
      client.move();
      client.remove();
    });
  }

  move() {
    this.socket.on('move', function(data) {
      movePlayer(data.id, data.expectedPosition.x, data.expectedPosition.y);
    });
  }

  remove() {
    this.socket.on('remove', function(id) {
      removePlayer(id);
    });
  }

  // Client Emit Functions
  sendTest() {
    this.socket.emit('test');
  }

  addClientToServer() {
    this.socket.emit('newplayer');
  }

  updatePlayerInput(id, direction) {
    this.socket.emit('movement', {
      direction: direction,
      id: id
    });
  }

  targetReached() {
    this.socket.emit('targetReached', {
      id: client.ID
    });
  }

}
