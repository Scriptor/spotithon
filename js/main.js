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
  
    Physics({
        timestep: 1000.0/160,
        maxIPF: 16,
        integrator: 'verlet'
    }, function(world){
        document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });

        var $viewport = document.getElementById('viewport');
        var viewWidth = $viewport.clientWidth;
        var viewHeight = $viewport.clientHeight;

        var computeTraj = function(x, y, vx, vy){
            var t2Ver, t2Hor; // time to vertical and horizontal bounds
            var d2Ver, d2Hor;
            var d, dx, dy;
            d2Hor = vx > 0 ? viewWidth - x : x;
            d2Ver = vy > 0 ? viewHeight - y : y;
            t2Hor = d2Hor / vx;
            t2Ver = d2Ver / vy;
            if(t2Hor < t2Ver){
                dy = t2Hor * vy;
                d = Math.sqrt(d2Hor*d2Hor + dy*dy);
            }else{
                dx = t2Ver * vx;
                d = Math.sqrt(dx*dx + d2Ver*d2Ver);
            }
            return d;
        }

        var addBall = function(x, y, vx, vy){
            var circle = Physics.body('circle', {
                x: x,
                y: y,
                vx: vx,//Math.random(),
                vy: vy,//Math.random(),
                radius: Math.sqrt(viewWidth*viewWidth+viewHeight*viewHeight)/32
                // radius: 20,
            });
            circle.styles = '#'+Math.floor(Math.random()*16777215).toString(16);

            var d = computeTraj(x, y, vx, vy);
            world.add(circle);

            var snd = new Osc();
            snd.play();
            //snd.changeFreq(300*Math.sqrt(vx*vx+vy*vy));
            if(isNaN(d)) {
                d = 0.1;
            }
            
            var pbrate = d / Math.sqrt(viewWidth*viewWidth+viewHeight*viewHeight);
            //snd.setRate(pbrate);
            snd.setRate(Math.sqrt(vx*vx + vy+vy));
            //snd.changeFilterFreq(0.5*d);
            snd.setGain(1/world.getBodies().length);
            circle.snd = snd;
            setTimeout(function(){
                snd.stop();
                world.remove(circle);
            }, Math.random() * 4000 + 4000);
        };

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
                  //angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
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

        world.on('collisions:detected', function( data ){
            var c;
            for (var i = 0, l = data.collisions.length; i < l; i++){
                c = data.collisions[ i ];
                world.emit('collision-pair', {
                    bodyA: c.bodyA,
                    bodyB: c.bodyB
                });
            }
        });

        // subscribe to collision pair
        world.on('collision-pair', function( data ){
            var stateA = data.bodyA.state;
            var stateB = data.bodyB.state;
            if(data.bodyA.snd){
                var vx = stateA.vel.x;
                var vy = stateA.vel.y;
                var trajA = computeTraj(stateA.pos.x, stateA.pos.y,
                                stateA.vel.x, stateA.vel.y);
                var pbrate = trajA / Math.sqrt(viewWidth*viewWidth+viewHeight*viewHeight);
                pbrate = Math.sqrt(vx*vx + vy*vy);
                data.bodyA.snd.setRate(pbrate);
                //data.bodyA.snd.changeFreq(0.5*trajA);
            }

            if(data.bodyB.snd){
                var vx = stateB.vel.x;
                var vy = stateB.vel.y;
                var trajB = computeTraj(stateB.pos.x, stateB.pos.y,
                                stateB.vel.x, stateB.vel.y);
                var pbrate = trajB / Math.sqrt(viewWidth*viewWidth+viewHeight*viewHeight);
                pbrate = Math.sqrt(vx*vx + vy*vy);
                data.bodyB.snd.setRate(pbrate);
                //data.bodyB.snd.changeFreq(0.5*trajB);
            }
        });

        // start the ticker
        Physics.util.ticker.start();
    });
});
