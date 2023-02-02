var gridSingleton = null;

AFRAME.registerComponent('puzzle-grid', {
    schema: {
        size: {type: "vec2", default: {x: 14, y: 15}}
    },

    init: function () {
        this.el.object3D.scale.x = this.data.size.x;
        this.el.object3D.scale.y = this.data.size.y;
        gridSingleton = this;
        this.gridDisplacement = 1;
        console.log(this.gridDisplacement);
        for (let i = 0; i < this.data.size.y; i++) {
            for (let j = 0; j < this.data.size.x; j++) {
                let newBox = document.createElement('a-box');
                newBox.object3D.position.x = (j+.5) / this.data.size.x - .5;
                newBox.object3D.position.y = (i+.5) / this.data.size.y - .5;
                newBox.object3D.position.z = .2;
                newBox.object3D.scale.x = .5 / (this.data.size.x);
                newBox.object3D.scale.y = .5 / (this.data.size.y);
                newBox.classList.add("peg");
                newBox.setAttribute('color', "#555");
                newBox.setAttribute('posX', j);
                newBox.setAttribute('posY', i);
                newBox.addEventListener('mouseenter', (evt) => {
                    if (selectedBlock) {
                        console.log("hovered");
                        this.tryPlacement(j, i, selectedBlock, newBox);
                    }
                })
                this.el.appendChild(newBox);

            }
        }

        this.fillGrid = [...Array(this.data.size.y)].map(e => Array(this.data.size.x).fill(true));
        console.log(this.fillGrid);
    },

    tryPlacement: function (x, y, block, peg) {

        let corner = block.centerToCornerCoord(x,y);
        let startX = corner.x;
        let startY = corner.y;

        console.log("X " + startX);
        console.log("Y " + startY);

        let endX = startX + block.data.size.x;
        let endY = startY + block.data.size.y;

        if (startX < 0 || startY < 0 || endX > this.data.size.x || endY > this.data.size.y) {
            block.placeTentative(corner, peg, false);
            console.log("Doesnt fit in border");
        } else {
            for (let i = startY; i < endY; i++) {
                for (let j = startX; j < endX; j++) {
                    if (this.fillGrid[i][j]) {
                        block.placeTentative(corner, peg, false);
                        console.log("X " + i + " Y " + j);
                        return;
                    }
                }
            }
            block.placeTentative(corner, peg, true);
        }

    },

    confirmPlacement: function (attachPoint, block) {
        let startX = attachPoint.x;
        let startY = attachPoint.y;
        let endX = startX + block.data.size.x;
        let endY = startY + block.data.size.y;

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                this.fillGrid[i][j] = true;
            }
        }
    },

    deletePlacement: function (attachPoint, block) {
        console.log(attachPoint);
        let startX = attachPoint.x;
        let startY = attachPoint.y;
        let endX = startX + block.data.size.x;
        let endY = startY + block.data.size.y;

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                this.fillGrid[i][j] = false;
            }
        }
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});