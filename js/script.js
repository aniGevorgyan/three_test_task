$(document).ready(function () {

  var box1 = document.querySelector('.canvas_1');
  var box2 = document.querySelector('.canvas_2');
  var box3 = document.querySelector('.canvas_3');

  var width = box1.parentElement.clientWidth - 100;
  var height = box1.parentElement.clientHeight;

  var data = [];
  var sendingData = [];

  var obj1 = {
    'id': 1,
    'img': '../../3D/obj_3/model.obj',
    'img_mtl': '../../3D/obj_3/model.mtl',
    'area': box1,
    'objectSize': 1.2,
    'innerWidth': width,
    'innerHeight': height,
    'positionZ': 50,
    'positionY': 50,
    'positionX': 50,
    'THREEColor': '#ffffff',
    'rendSizeW': width,
    'rendSizeH': height
  };

  var obj2 = {
    'id': 2,
    'img': '../../3D/obj_1/tomato_Reduced.obj',
    'img_mtl': '../../3D/obj_1/tomato_Reduced.mtl',
    'area': box2,
    'objectSize': 3.5,
    'innerWidth': width,
    'innerHeight': height,
    'positionZ': 50,
    'positionY': 0,
    'positionX': 0,
    'THREEColor': '#ffffff',
    'rendSizeW': width,
    'rendSizeH': height
  };

  var obj3 = {
    'id': 3,
    'img': '../../3D/obj_4/pumpkin_3.obj',
    'img_mtl': '../../3D/obj_4/pumpkin_3.mtl',
    'area': box3,
    'objectSize': 8,
    'innerWidth': width,
    'innerHeight': height,
    'positionZ': 50,
    'positionY': 50,
    'positionX': 50,
    'THREEColor': '#ffffff',
    'rendSizeW': width,
    'rendSizeH': height
  };

  function init(content) {
    //Scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(content.THREEColor);

    //Camera
    var camera = new THREE.PerspectiveCamera(content.objectSize, content.innerWidth / content.innerHeight, 0.1, 3000);
    camera.position.z = content.positionZ;
    camera.position.y = content.positionY;
    camera.position.x = content.positionX;

    //render
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(content.rendSizeW, content.rendSizeH);
    content.area.appendChild(renderer.domElement);

    //OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 40;

    //Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    var light = new THREE.PointLight(0xc4c4c4, 1);
    light.position.set(0, 300, 500);
    scene.add(light);

    var light_rigth = new THREE.PointLight(0xc4c4c4, 1);
    light_rigth.position.set(500, 300, 500);
    scene.add(light_rigth);

    var light_left = new THREE.PointLight(0xc4c4c4, 1);
    light_left.position.set(0, 300, -500);
    scene.add(light_left);

    var light_bottom = new THREE.PointLight(0xc4c4c4, 1);
    light_bottom.position.set(-500, 300, 500);
    scene.add(light_bottom);

    //model

    const objLoader = new THREE.OBJLoader();
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.load(content.img_mtl, (mtl) => {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load(content.img, (root) => {
        scene.add(root);
      });
    });

    //Resize
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(content.rendSizeW, content.rendSizeH);
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // on Tab Close
    $('.reload').on('click', function () {
      var arrOfKeys = data.map(el => el.last_position?.number);
      if (arrOfKeys.indexOf(content.id) === -1) {
        sendingData.push({number: content.id, x: camera.position.x, y: camera.position.y, z: camera.position.z});
      } else {
        var el = arrOfKeys.indexOf(content.id);
        console.log("oooooo", content);
        if (!sendingData[el]) sendingData[el] = {};
        sendingData[el]['_id'] = content['_id'];
        sendingData[el]['number'] = content.id;
        sendingData[el]['x'] = camera.position.x;
        sendingData[el]['y'] = camera.position.y;
        sendingData[el]['z'] = camera.position.z;
      }

      // Set last positions of objects
      if (sendingData.length === 3) {
        var last_position = {last_position: sendingData};
        var json = JSON.stringify(last_position)
        $.ajax({
          type: "POST",
          url: 'http://localhost:4000/three',
          data: json,
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (response) {
            window.location.reload();
          }
        });
      }
    })
  }

  // Get positions of objects
  $.ajax({
    type: "GET",
    url: 'http://localhost:4000/three',
    dataType: "json",
    success: function (response) {
      if (response['count'] > 0) {
        data = response['positions'];
        response['positions'].forEach(el => {
          if (el['last_position']['number'] === 1) {
            obj1._id = el._id;
            obj1.positionX = el['last_position']['x'];
            obj1.positionY = el['last_position']['y'];
            obj1.positionZ = el['last_position']['z'];
            init(obj1);
          } else if (el['last_position']['number'] === 2) {
            obj2._id = el._id;
            obj2.positionX = el['last_position']['x'];
            obj2.positionY = el['last_position']['y'];
            obj2.positionZ = el['last_position']['z'];
            init(obj2);
          } else if (el['last_position']['number'] === 3) {
            obj3._id = el._id;
            obj3.positionX = el['last_position']['x'];
            obj3.positionY = el['last_position']['y'];
            obj3.positionZ = el['last_position']['z'];
            init(obj3);
          }
        });
      } else {
        init(obj1);
        init(obj2);
        init(obj3);
      }
    }
  });
});