"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEvents = exports.loadInterFace = exports.loadMicroService = exports.Application = void 0;
var node_events_1 = require("node:events");
var ApplicationEvents = new node_events_1.EventEmitter();
exports.ApplicationEvents = ApplicationEvents;
var Application;
(function (Application) {
    Application["LOAD_INTERFACE"] = "loadinterface";
    Application["LOAD_MICROSERVICE"] = "loadmicroservice";
    Application["GET_INTERFACE"] = "getinterface";
})(Application || (Application = {}));
exports.Application = Application;
function loadMicroService() {
    ApplicationEvents.emit(Application.LOAD_MICROSERVICE);
}
exports.loadMicroService = loadMicroService;
function loadInterFace(args) {
    ApplicationEvents.emit(Application.LOAD_INTERFACE, args);
}
exports.loadInterFace = loadInterFace;