
const express = require('express');



module.exports = function (app) {
  app.route('/helloWord').get(function (req, res) {
    res.send('Hello World')
  })
}

