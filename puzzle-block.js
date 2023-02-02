const BLOCK_STATES = [
    "Set",
    "PreExplode",
    "Exploded",
    "TentativeBad",
    "TentativeGood"
];

const explosionPos = new THREE.Vector3(0,0,-8);

var selectedBlock = null;

AFRAME.registerComponent('puzzle-block', {
    schema: {
        position: {type: "vec2"},
        size: {type: "vec2", default: {x: 1, y: 1}}
    },

    init: function () {
        this.el.object3D.scale.x = this.data.size.x - .2;
        this.el.object3D.scale.y = this.data.size.y - .2;
        this.el.object3D.position.x = this.data.position.x + this.data.size.x*.5 - gridSingleton.data.size.x/2;
        this.el.object3D.position.y = this.data.position.y + this.data.size.y*.5 - gridSingleton.data.size.y/2;
        this.el.object3D.position.z = gridSingleton.el.object3D.position.z + .3;
    
        // Prep explosion pos for before first explode
        let gridSize = new THREE.Vector2(gridSingleton.data.size.x, gridSingleton.data.size.y);
        this.explodedPosition = new THREE.Vector3(1,0,0).multiplyScalar(gridSize.length()/2);
        this.explodedPosition.applyEuler(new THREE.Euler(0, 0, Math.random()*6.28));
        this.explodedPosition.z = gridSingleton.el.object3D.position.z + 3;
        this.rotationTarget = new THREE.Vector3(0,0,0);
        this.explodedRotation = new THREE.Vector3(0,0,0);

        this.state = "Set";
        // this.explodedPosition = null;
        // this.explodedRotation = null;
        this.positionTarget = this.el.object3D.position;
        this.rotationTarget = this.el.object3D.rotation;
        this.moveSpeed = 6;
        this.rotationSpeed = 8;
        this.attachPoint = new THREE.Vector2(this.data.position.x, this.data.position.y);
    },

    update: function () {
        
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        let delta = timeDelta/1000;
        let alphaProgress = (this.moveSpeed * delta);
        alphaProgress = Math.max(0, alphaProgress);
        alphaProgress = Math.min(1, alphaProgress);
        this.el.object3D.position = this.el.object3D.position.lerp(this.positionTarget, alphaProgress);

        if (this.state != "PreExplode") {
            let rotationAlphaProgress = this.rotationSpeed * delta;
            rotationAlphaProgress = Math.min(1, rotationAlphaProgress);
            rotationAlphaProgress = Math.max(0, rotationAlphaProgress);
            this.el.object3D.rotation.x = lerp(this.el.object3D.rotation.x, this.rotationTarget.x, rotationAlphaProgress);
            this.el.object3D.rotation.y = lerp(this.el.object3D.rotation.y, this.rotationTarget.y, rotationAlphaProgress);
            this.el.object3D.rotation.z = lerp(this.el.object3D.rotation.z, this.rotationTarget.z, rotationAlphaProgress);
        }
        switch (this.state) {
            case "PreExplode":
                this.el.object3D.rotation.x += this.randRotationSpeed.x * delta;
                this.el.object3D.rotation.y += this.randRotationSpeed.y * delta;
                this.el.object3D.rotation.z += this.randRotationSpeed.z * delta;

                this.randRotationSpeed = this.randRotationSpeed.multiplyScalar(1+(.2*delta));

                if (this.randRotationSpeed.lengthSq() > 400) {
                    this.doExplosion();
                }

        }

    },

    preExplode: function () {
        this.positionTarget = explosionPos;
        this.state = "PreExplode";
        this.randRotationSpeed = new THREE.Vector3((Math.random() -.5), (Math.random() -.5), (Math.random() -.5));
        this.randRotationSpeed = this.randRotationSpeed.multiplyScalar(10);
        if (this.randRotationSpeed.length() < 4) {
            this.randRotationSpeed = this.randRotationSpeed.normalize().multiplyScalar(4);
        }
    },

    doExplosion: function () {
        this.state = "Exploded";
        // console.log(gridSingleton.data.size);
        let gridSize = new THREE.Vector2(gridSingleton.data.size.x, gridSingleton.data.size.y);
        this.explodedPosition = new THREE.Vector3(1,0,0).multiplyScalar(gridSize.length()/2);
        this.explodedPosition.applyEuler(new THREE.Euler(0, 0, Math.random()*6.28));
        this.explodedPosition.z = gridSingleton.el.object3D.position.z + 3;

        console.log(this.el.object3D.rotation);

        this.explodedRotation = this.el.object3D.rotation.clone();
        this.explodedRotation.x = this.explodedRotation.x % 3.14;
        this.explodedRotation.y = this.explodedRotation.y % 3.14;
        this.explodedRotation.z = this.explodedRotation.z % 3.14;
        
        // console.log(this.el.object3D.rotation);
        this.el.object3D.rotation.x = this.explodedRotation.x;
        this.el.object3D.rotation.y = this.explodedRotation.y;
        this.el.object3D.rotation.z = this.explodedRotation.z;

        this.rotationTarget = this.explodedRotation;

        this.positionTarget = this.explodedPosition;
    },

    selectBlock: function () {
        // this.state = "Held";
        if (this.state == "PreExplode") return;
        selectedBlock = this;
        // this.el.setAttribute('color', 'red');
        this.rotationTarget = new THREE.Vector3(0,0,0);
        for (el of document.querySelectorAll("[raycaster]")) {
            el.setAttribute("raycaster", "objects: .peg");
        }
        if (this.state == "Set") {
            this.state = "TentativeGood";
            gridSingleton.deletePlacement(this.attachPoint, this);
        }
    },

    deselectBlock: function () {
        // this.state = "Held";
        selectedBlock = null;
        // this.el.setAttribute('color', 'blue');
        for (el of document.querySelectorAll("[raycaster]")) {
            el.setAttribute("raycaster", "objects: .puzzle-block");
        }
        switch (this.state) {
            case "Exploded":
            case "TentativeBad":
                this.positionTarget = this.explodedPosition;
                this.rotationTarget = this.explodedRotation;
                console.log(this.explodedRotation);
                this.state = "Exploded";
                break;
            case "TentativeGood":
                gridSingleton.confirmPlacement(this.attachPoint, this);
                this.state = "Set";
                this.positionTarget.z = gridSingleton.el.object3D.position.z + .3;
                break;
        }
    },

    placeTentative: function (corner, peg, good) {
        this.positionTarget = peg.object3D.getWorldPosition();
        if (this.data.size.x % 2 == 0) {
            this.positionTarget.x += .5;
        }
        if (this.data.size.y % 2 == 0) {
            this.positionTarget.y += .5;
        }
        if (good) {
            this.state = "TentativeGood";
            this.positionTarget.z = gridSingleton.el.object3D.position.z + 1;
        } else {
            this.state = "TentativeBad";
            this.positionTarget.z = gridSingleton.el.object3D.position.z + 2;
        }
        this.rotationTarget = new THREE.Vector3(0,0,0);
        this.attachPoint = corner;

    },

    centerToCornerCoord: function (x,y) {
        let outX = x - (((this.data.size.x - 1) / 2) >> 0);
        let outY = y - (((this.data.size.y - 1) / 2) >> 0);
        return new THREE.Vector2(outX, outY);
    },

    events: {
        mousedown: function (evt) {
            this.selectBlock();
        },
        mouseup: function (evt) {
            if (selectedBlock == this) {
                this.deselectBlock();
            }
        }
    }
});