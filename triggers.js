document.addEventListener('keydown', function(event) {
    console.log(event.key);
    if (event.key == "e") {
        let blocks = document.querySelectorAll("[puzzle-block]");
        for (let block of blocks) {
            console.log("Testing e trigger");
            block.components["puzzle-block"].preExplode();
        }
        for (let row of gridSingleton.fillGrid) {
            row.fill(false);
        }
    }
});

var lerp = (a,b,t) => a+(b-a)*t;