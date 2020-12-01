/* global AFRAME */

/**
 * Component that listens to an event, fades out an entity, swaps the texture, and fades it
 * back in.
 */
AFRAME.registerComponent('move-camera', {
  schema: {
    on: {type: 'string'},
    camera: {type: 'selector'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    
    document.querySelector('#place1').object3D.visible=true;
    document.querySelector('#place2').object3D.visible=true;
    document.querySelector('#place3').object3D.visible=false;
    /*click*/
    el.addEventListener(data.on, function () {
    
     data.camera.object3D.position.set( el.parentEl.components.position.data.x,
                                        el.parentEl.components.position.data.y,
                                        el.parentEl.components.position.data.z);
      switch(el.parentEl.id){
        case "place1":
          console.log("borrar el tres");
          document.querySelector('#place1').object3D.visible=true;
          document.querySelector('#place2').object3D.visible=true;
          document.querySelector('#place3').object3D.visible=false;
        break;
        case "place2":
          console.log("mostrar todos");
          document.querySelector('#place1').object3D.visible=true;
          document.querySelector('#place2').object3D.visible=true;
          document.querySelector('#place3').object3D.visible=true;
        break;
        case "place3":
          console.log("ocultar el uno");
          document.querySelector('#place1').object3D.visible=false;
          document.querySelector('#place2').object3D.visible=true;
          document.querySelector('#place3').object3D.visible=true;  
        break;
      }
    });
  }

});