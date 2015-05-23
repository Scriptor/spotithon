require.config({
  baseUrl: 'http://wellcaffeinated.net/PhysicsJS/assets/scripts/vendor/',
  packages: [
    {
      name: 'physicsjs',
      location: 'physicsjs-current',
      main: 'physicsjs-full.min'
    }
  ]
});

require([
  'physicsjs',
  'pixi'
], function( Physics, PIXI ){
  window.PIXI = PIXI;
  
  var worldConfig = {
    // timestep
    timestep: 6,
    // maximum number of iterations per step
    maxIPF: 4,
    // default integrator
    integrator: 'verlet',
    // is sleeping disabled?
    sleepDisabled: false,
    // speed at which bodies wake up
    sleepSpeedLimit: 0.1,
    // variance in position below which bodies fall asleep
    sleepVarianceLimit: 2,
    // time (ms) before sleepy bodies fall asleep
    sleepTimeLimit: 500
  };
  
  /*
  Physics( worldConfig, [
    initWorld,
    addInteraction,
    addBodies,
    startWorld
  ]);
  */
    Physics({
        timestep: 1000.0/160,
        maxIPF: 16,
        integrator: 'verlet'
    }, function(world){
        var viewWidth = document.getElementById('viewport').clientWidth;
        var viewHeight = document.getElementById('viewport').clientHeight;

        var renderer = Physics.renderer('canvas', {
          el: 'viewport',
          width: viewWidth,
          height: viewHeight,
          meta: false, // don't display meta data
          styles: {
              // set colors for the circle bodies
              'circle' : {
                  strokeStyle: 'hsla(60, 37%, 17%, 1)',
                  lineWidth: 1,
                  fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                  angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
              }
          }
        });
        // add the renderer
        world.add( renderer );


        world.on('step', function(){
            // Note: equivalent to just calling world.render() after world.step()
            world.render();
        });

        var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
        // constrain objects to these bounds
        world.add(Physics.behavior('edge-collision-detection', {
          aabb: viewportBounds,
          restitution: 0.99,
          cof: 0.99
        }));

        world.add(
            Physics.body('circle', {
                x: 50, // x-coordinate
                y: 30, // y-coordinate
                vx: 0.2, // velocity in x-direction
                vy: 0.01, // velocity in y-direction
                radius: 20
            })
        );

        world.add( Physics.behavior('body-impulse-response') );

        // add some gravity
        world.add( Physics.behavior('constant-acceleration') );

        Physics.util.ticker.on(function( time, dt ){

            world.step( time );
        });

        // start the ticker
        Physics.util.ticker.start();
    });
});
