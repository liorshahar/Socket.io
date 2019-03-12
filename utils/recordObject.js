class Record {
  constructor(training_id, exercise_id) {
    this.training_id = training_id;
    this.exercise_id = exercise_id;
    this.date = new Date();
    this.routes = {};
  }

  setStartTime(start_time) {
    this.start_time = start_time;
  }

  setResults(route, touch_time) {
    let routeObj = this.routes[`route${route}`];
    if (!routeObj) {
      routeObj = this.routes[`route${route}`] = new Route();
    }
    routeObj.results.push((touch_time - this.start_time) / 1000);
  }

  setJumpTime(route, jump_time) {
    let routeObj = this.routes[`route${route}`];
    if (!routeObj) {
      routeObj = this.routes[`route${route}`] = new Route();
    }
    routeObj.jump_time = (jump_time - this.start_time) / 1000;
  }
}

class Route {
  constructor() {
    this.jump_time = 0;
    this.results = [];
  }
}

module.exports = Record;
