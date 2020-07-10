((window, document) => {
  let ancho, alto;
  let dibujando, posicionX, posicionY;

  function getX(e) {
    return e.clientX || e.touches[0].clientX;
  }
  function getY(e) {
    return e.clientY || e.touches[0].clientY;
  }
  function on(el, types, listener) {
    types.split(",").forEach((type) => {
      el.addEventListener(type, listener, false);
    });
  }
  function acelerar(fn) {
    let activo = false;
    return function () {
      if (!activo) {
        requestAnimationFrame(() => {
          fn.apply(null, arguments);
          activo = false;
        });
        activo = true;
      }
    };
  }

  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");

  const socket = io();
  socket.on("dibujo", ([x0, y0, x1, y1]) => {
    dibujarLinea(x0 * ancho, y0 * alto, x1 * ancho, y1 * alto, false);
  });

  function redimensionar() {
    ancho = canvas.width = innerWidth;
    alto = canvas.height = innerHeight;
  }
  on(window, "resize", acelerar(redimensionar));
  redimensionar();

  function dibujarLinea(x0, y0, x1, y1, enviar) {
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
    if (enviar) {
      socket.emit("dibujo", [x0 / ancho, y0 / alto, x1 / ancho, y1 / alto]);
    }
  }
  on(canvas, "mousedown,touchstart", function comenzar(e) {
    dibujando = true;
    posicionX = getX(e);
    posicionY = getY(e);
  });
  on(canvas, "mouseup,mouseout,touchend,touchcancel", function terminar(e) {
    if (!dibujando) return;
    dibujando = false;
    dibujarLinea(posicionX, posicionY, getX(e), getY(e), true);
  });
  on(
    canvas,
    "mousemove,touchmove",
    acelerar(function procesar(e) {
      if (!dibujando) return;
      dibujarLinea(
        posicionX,
        posicionY,
        (posicionX = getX(e)),
        (posicionY = getY(e)),
        true
      );
    })
  );
})(window, document);
