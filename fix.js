(function(){
  function waitAndRender(){
    var el = document.getElementById('restaurante-content');
    if(!el){ setTimeout(waitAndRender, 500); return; }
    
    // Poner banner visible inmediatamente
    el.innerHTML = '<div style="background:#1F4E79;color:#fff;padding:20px;border-radius:16px;text-align:center;margin:12px 0"><div style="font-size:32px">🍽️</div><div style="font-weight:700;font-size:16px">Restaurante</div><div style="font-size:12px;opacity:.8">Listo</div></div>';
    
    // Sobreescribir renderRestauranteInt
    window.renderRestauranteInt = function(){
      var el = document.getElementById('restaurante-content');
      if(!el) return;
      try {
        var hoyStr = typeof hoy==='function' ? hoy() : new Date().toISOString().slice(0,10);
        var transfers = (window.S && S.transfsRest && S.transfsRest[hoyStr]) ? S.transfsRest[hoyStr] : [];
        var costoHoy = transfers.reduce(function(s,t){ return s+(t.costo||0); },0);
        var ventaHoy = transfers.reduce(function(s,t){ return s+(t.precioVenta||0); },0);
        var f = function(n){ return '$'+Number(n||0).toLocaleString('es-CO'); };

        var h = '<div style="padding:4px 0 100px">';
        h += '<div style="background:linear-gradient(135deg,#1a3a2a,#0d2318);color:#fff;padding:16px;border-radius:16px;margin-bottom:14px;display:flex;align-items:center;gap:12px"><div style="font-size:32px">🍽️</div><div><div style="font-size:15px;font-weight:700">Transferencias al Restaurante</div><div style="font-size:11px;opacity:.7">Los productos salen del inventario</div></div></div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
        h += '<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">HOY</div><div style="font-size:22px;font-weight:700;color:#1F4E79">'+transfers.length+'</div></div>';
        h += '<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">COSTO</div><div style="font-size:13px;font-weight:700;color:#B71C1C">'+f(costoHoy)+'</div></div>';
        h += '<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">VENTA</div><div style="font-size:13px;font-weight:700;color:#1E5631">'+f(ventaHoy)+'</div></div>';
        h += '</div>';
        h += '<div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid #ece6db">';
        h += '<div style="font-size:13px;font-weight:700;color:#1F4E79;margin-bottom:12px">📦 Nueva Transferencia</div>';
        h += '<div style="position:relative;margin-bottom:8px"><span style="position:absolute;left:10px;top:50%;transform:translateY(-50%)">🔍</span><input type="text" id="ri-search" placeholder="Buscar producto..." oninput="window.filtrarRIProds&&filtrarRIProds()" onfocus="window.filtrarRIProds&&filtrarRIProds()" autocomplete="off" style="width:100%;padding:10px 12px 10px 32px;border:2px solid #ddd;border-radius:11px;font-size:14px;font-family:inherit;box-sizing:border-box"></div>';
        h += '<div id="ri-prod-lista" style="display:none;max-height:180px;overflow-y:auto;border:1px solid #ddd;border-radius:10px;margin-bottom:10px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>';
        h += '<div id="ri-prod-sel" style="display:none;padding:9px 12px;background:#e8f5ed;border-radius:10px;font-size:13px;font-weight:600;color:#1E5631;margin-bottom:10px"></div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px"><div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px">CANTIDAD</div><input type="number" id="ri-qty" placeholder="0" min="0.001" step="0.001" oninput="window.calcRIPreview&&calcRIPreview()" style="width:100%;padding:11px;border:2px solid #ddd;border-radius:11px;font-size:16px;font-weight:700;font-family:inherit;box-sizing:border-box"></div><div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px">UNIDAD</div><input id="ri-unit" readonly style="width:100%;padding:11px;border:2px solid #eee;border-radius:11px;font-size:16px;font-weight:700;font-family:inherit;box-sizing:border-box;background:#f5f5f5;color:#666"></div></div>';
        h += '<div style="margin-bottom:10px"><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px">MOTIVO</div><input id="ri-obs" value="Uso restaurante" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:11px;font-size:13px;font-family:inherit;box-sizing:border-box"></div>';
        h += '<button onclick="window.confirmarRITransf&&confirmarRITransf()" style="width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#1a3a2a,#1E5631);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">✅ Confirmar Transferencia</button>';
        h += '</div>';

        if(transfers.length > 0){
          h += '<div style="font-size:16px;font-weight:700;margin:4px 0 10px;color:#111">📋 Hoy — <span style="color:#D4A843">'+transfers.length+' transferencia'+(transfers.length!==1?'s':'')+'</span></div>';
          h += '<div style="background:#fff;border-radius:14px;padding:4px 14px 14px;border:1px solid #ece6db;margin-bottom:14px">';
          transfers.slice().reverse().forEach(function(t){
            h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f5f0ea"><div><div style="font-size:13px;font-weight:600">'+t.nombre+'</div><div style="font-size:10px;color:#888">'+(t.hora||'')+' · '+(t.obs||t.motivo||'')+'</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:700;color:#B71C1C">-'+t.cantidad+' '+(t.unidad||'')+'</div><div style="font-size:10px;color:#888">'+f(t.costo||0)+'</div></div></div>';
          });
          h += '</div>';
        }
        h += '</div>';
        el.innerHTML = h;
      } catch(e) {
        el.innerHTML = '<div style="padding:20px;color:red;font-size:12px;background:#fff;border-radius:12px;border:2px solid red"><b>Error:</b> '+e.message+'</div>';
      }
    };

    // Interceptar el botón de restaurante
    var btn = document.getElementById('nav-restaurante');
    if(btn){
      btn.addEventListener('click', function(){
        setTimeout(function(){ window.renderRestauranteInt(); }, 150);
      });
    }
  }

  // Esperar a que el DOM esté listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(waitAndRender, 1000); });
  } else {
    setTimeout(waitAndRender, 1000);
  }
})();
