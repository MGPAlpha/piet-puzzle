document.addEventListener('keydown', function(event) {
    console.log(event.key);
    if (event.key == "e") {
        explode();
    }
});

// document.addEventListener('buttondown', function(event) {
//     // console.log(event.key);
//     // if (event.button == "a") {
//         explode();
//     // }
// });

function explode() {
    let blocks = document.querySelectorAll("[puzzle-block]");
        for (let block of blocks) {
            console.log("Testing e trigger");
            block.components["puzzle-block"].preExplode();
        }
        for (let row of gridSingleton.fillGrid) {
            row.fill(false);
        }
}

AFRAME.registerComponent('explode-listener', {
    init: function () {
      var el = this.el;
      el.addEventListener('abuttondown', explode);
      el.addEventListener('bbuttondown', explode);
      el.addEventListener('xbuttondown', explode);
      el.addEventListener('ybuttondown', explode);
    }
  });

var lerp = (a,b,t) => a+(b-a)*t;