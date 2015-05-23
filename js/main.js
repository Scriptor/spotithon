require.config({
  baseUrl: 'js',
  packages: [
    {
      name: 'physicsjs',
      location: 'PhysicsJS-0.7.0/dist',
      main: 'physicsjs-full.min'
    }
  ]
});

require([
  'physicsjs'
], function( Physics){
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
        var $viewport = document.getElementById('viewport');
        var addBall = function(x, y, vx, vy){
            var circle = Physics.body('circle', {
                x: x,
                y: y,
                vx: vx,//Math.random(),
                vy: vy,//Math.random(),
                radius: 20
            });
            world.add(circle);
        };

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
        world.add(Physics.behavior('interactive', {el: renderer.container}));

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

        var i, circle ,circles = [];
        var x, y, vx, vy;
        /*
        for(i=0; i<10; i++){
            x = Math.random() * viewWidth;
            y = Math.random() * viewHeight;
            vx = Math.random();
            vy = Math.random();
            circle = Physics.body('circle', {
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                radius: 20
            });
            world.add(circle);
        }
        */

        world.add(Physics.behavior('body-impulse-response'));
        world.add(Physics.behavior('body-collision-detection'));
        world.add(Physics.behavior('sweep-prune'));

        // add some gravity
        //world.add( Physics.behavior('constant-acceleration') );

        Physics.util.ticker.on(function( time, dt ){

            world.step( time );
        });

        var startX, startY, startTime;
        world.on('interact:poke', function(data){
            startX = data.x;
            startY = data.y;
            startTime = Date.now();
        });

        world.on('interact:release', function( data ){
            if(data.body) return;

            var dx, dy;
            var vx, vy;
            var now = Date.now();

            dx = data.x - startX;
            dy = data.y - startY;
            vx = dx/(now - startTime) * 0.2;
            vy = dy/(now - startTime) * 0.2;
            addBall(data.x, data.y, vx, vy);
        });
        //addEvents();
        // start the ticker
        Physics.util.ticker.start();
    });
});
