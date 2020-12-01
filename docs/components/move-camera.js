/* global AFRAME */

/**
 * Component that listens to an event, fades out an entity, swaps the texture, and fades it
 * back in.
 */
AFRAME.registerComponent('move-camera', {
  schema: {
    on: {type: 'string'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    

    el.addEventListener(data.on, function () {
     console.log(data);
    });
  }

});