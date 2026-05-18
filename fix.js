(function(){
  var btn=document.getElementById('nav-restaurante');
  if(!btn) return;
  
  btn.addEventListener('click',function(){
    setTimeout(renderRest, 150);
  });

  function fmt(n){ return '$'+Number(n||0).toLocaleString('es-CO'); }

  function renderRest(){
    var el=document.getElementById('restaurante-content');
    if(!el) return;
    var S=window.S||{};
    var hoyStr=typeof hoy==='function'?hoy():new Date().toISOString().slice(0,10);
    var transfers=(S.transfsRest&&S.transfsRest[hoyStr])||[];
    var costoHoy=transfers.reduce(function(s,t){return s+(t.costo||0);},0);
    var ventaHoy=transfers.reduce(function(s,t){return s+(t.precioVenta||0);},0);

    var h='<div style="padding:4px 0 100px">';
    h+='<div style="background:linear-gradient(135deg,#1a3a2a,#0d2318);color:#fff;padding:16px;border-radius:16px;margin-bottom:14px;display:flex;align-items:center;gap:12px"><div style="font-size:32px">🍽️</div><div><div style="font-size:15px;font-weight:700">Transferencias al Restaurante</div><div style="font-size:11px;opacity:.7">Descuenta del inventario automáticamente</div></div></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">HOY</div><div style="font-size:22px;font-weight:700;color:#1F4E79">'+transfers.length+'</div></div>';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">COSTO</div><div style="font-size:13px;font-weight:700;color:#B71C1C">'+fmt(costoHoy)+'</div></div>';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">VENTA</div><div style="font-size:13px;font-weight:700;color:#1E5631">'+fmt(ventaHoy)+'</div></div>';
    h+='</div>';

    h+='<div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid #ece6db">';
    h+='<div style="font-size:13px;font-weight:700;color:#1F4E79;margin-bottom:12px">📦 Nueva Transferencia</div>';
    h+='<div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px;text-transform:uppercase;letter-spacing:.8px">Producto</div>';
    h+='<input type="text" id="fx-search" placeholder="🔍 Buscar producto..." autocomplete="off" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:11px;font-size:14px;font-family:inherit;box-sizing:border-box;margin-bottom:6px">';
    h+='<div id="fx-lista" style="display:none;max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:10px;margin-bottom:10px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>';
    h+='<div id="fx-sel" style="display:none;padding:9px 12px;background:#e8f5ed;border-radius:10px;font-size:13px;font-weight:600;color:#1E5631;margin-bottom:10px;border:1px solid #c8e6c9"></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
    h+='<div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px;text-transform:uppercase">Cantidad</div><input type="number" id="fx-qty" placeholder="0" min="0.001" step="0.001" style="width:100%;padding:11px;border:2px solid #ddd;border-radius:11px;font-size:16px;font-weight:700;font-family:inherit;box-sizing:border-box"></div>';
    h+='<div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px;text-transform:uppercase">Unidad</div><input id="fx-unit" readonly style="width:100%;padding:11px;border:2px solid #eee;border-radius:11px;font-size:16px;font-weight:700;font-family:inherit;box-sizing:border-box;background:#f5f5f5;color:#666"></div>';
    h+='</div>';
    h+='<div style="margin-bottom:10px"><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:5px;text-transform:uppercase">Motivo</div><input id="fx-obs" value="Uso restaurante" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:11px;font-size:13px;font-family:inherit;box-sizing:border-box"></div>';
    h+='<div id="fx-preview" style="display:none;background:#f8f9fa;border-radius:10px;padding:12px;margin-bottom:12px;border:1px solid #e0e0e0"><div style="font-size:10px;font-weight:700;color:#888;margin-bottom:6px">RESUMEN PREVIO</div><div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Costo total</span><span id="fx-prev-costo" style="font-weight:700;color:#B71C1C">$0</span></div><div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Precio venta equiv.</span><span id="fx-prev-venta" style="font-weight:700;color:#1E5631">$0</span></div></div>';
    h+='<button id="fx-btn-confirm" style="width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#1a3a2a,#1E5631);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">✅ Confirmar Transferencia</button>';
    h+='</div>';

    // Historial
    if(transfers.length>0){
      h+='<div style="font-size:16px;font-weight:700;margin:4px 0 10px;color:#111">📋 Hoy — <span style="color:#D4A843">'+transfers.length+' transferencia'+(transfers.length!==1?'s':'')+'</span></div>';
      h+='<div style="background:#fff;border-radius:14px;padding:4px 14px 14px;border:1px solid #ece6db;margin-bottom:14px">';
      transfers.slice().reverse().forEach(function(t){
        var usuarioColor=t.usuario?'#1F4E79':'#aaa';
        h+='<div style="padding:10px 0;border-bottom:1px solid #f5f0ea">';
        h+='<div style="display:flex;justify-content:space-between;align-items:flex-start">';
        h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#111">'+t.nombre+'</div>';
        h+='<div style="font-size:10px;color:#888;margin-top:2px">'+(t.hora||'')+' · '+(t.obs||t.motivo||'Uso restaurante')+'</div>';
        if(t.usuario) h+='<div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;background:#e8f0fe;border-radius:20px;padding:2px 8px"><span style="font-size:9px;color:#1F4E79;font-weight:700">👤 '+t.usuario+'</span></div>';
        h+='</div>';
        h+='<div style="text-align:right;flex-shrink:0;padding-left:10px"><div style="font-size:14px;font-weight:700;color:#B71C1C">−'+t.cantidad+' '+(t.unidad||'')+'</div><div style="font-size:10px;color:#888">'+fmt(t.costo||0)+'</div></div>';
        h+='</div></div>';
      });
      h+='</div>';
    }

    h+='</div>';
    el.innerHTML=h;

    // Buscador
    var search=document.getElementById('fx-search');
    var lista=document.getElementById('fx-lista');
    var selDiv=document.getElementById('fx-sel');
    var qtyEl=document.getElementById('fx-qty');
    var unitEl=document.getElementById('fx-unit');
    var preview=document.getElementById('fx-preview');
    var prevCosto=document.getElementById('fx-prev-costo');
    var prevVenta=document.getElementById('fx-prev-venta');
    var confirmBtn=document.getElementById('fx-btn-confirm');
    var selProd=null;

    function filtrar(){
      var q=(search.value||'').toLowerCase().trim();
      var prods=(window.S&&window.S.productos)||[];
      var filtered=prods.filter(function(p){ return !q||p.nombre.toLowerCase().indexOf(q)!==-1; });
      if(!filtered.length){
        lista.innerHTML='<div style="padding:12px 14px;font-size:12px;color:#888">Sin resultados</div>';
      } else {
        lista.innerHTML=filtered.map(function(p){
          var stk=p.stock||p.cant||0;
          var sc=stk>0?'#1E5631':'#B71C1C';
          return '<div style="padding:11px 14px;border-bottom:1px solid #f0ece4;cursor:pointer;display:flex;justify-content:space-between;align-items:center" data-id="'+p.id+'" data-nombre="'+p.nombre.replace(/"/g,'&quot;')+'" data-stock="'+stk+'" data-unidad="'+(p.unidad||'Kg')+'" data-costo="'+(p.costo||0)+'" data-precio="'+(p.precio||0)+'"><div style="font-size:13px;font-weight:600">'+p.nombre+'</div><span style="font-size:11px;font-weight:700;color:'+sc+'">'+stk+' '+(p.unidad||'Kg')+'</span></div>';
        }).join('');
        lista.querySelectorAll('div[data-id]').forEach(function(row){
          row.onclick=function(){
            selProd={
              id:this.dataset.id,
              nombre:this.dataset.nombre,
              stock:parseFloat(this.dataset.stock),
              unidad:this.dataset.unidad,
              costo:parseFloat(this.dataset.costo),
              precio:parseFloat(this.dataset.precio)
            };
            search.value=selProd.nombre;
            lista.style.display='none';
            var sc=selProd.stock>0?'#1E5631':'#B71C1C';
            selDiv.innerHTML='<span style="color:'+sc+'">'+(selProd.stock>0?'✅':'⚠️')+' '+selProd.nombre+' — Stock: '+selProd.stock+' '+selProd.unidad+'</span>';
            selDiv.style.display='block';
            unitEl.value=selProd.unidad;
            qtyEl.max=selProd.stock;
            qtyEl.focus();
            actualizarPreview();
          };
        });
      }
      lista.style.display='block';
    }

    function actualizarPreview(){
      if(!selProd) return;
      var qty=parseFloat(qtyEl.value)||0;
      if(qty>0){
        prevCosto.textContent=fmt(qty*selProd.costo);
        prevVenta.textContent=fmt(qty*selProd.precio);
        preview.style.display='block';
      } else {
        preview.style.display='none';
      }
    }

    search.addEventListener('input', filtrar);
    search.addEventListener('focus', filtrar);
    qtyEl.addEventListener('input', actualizarPreview);

    confirmBtn.onclick=function(){
      if(!selProd){showToast&&showToast('⚠️ Selecciona un producto');return;}
      var qty=parseFloat(qtyEl.value)||0;
      if(!qty||qty<=0){showToast&&showToast('⚠️ Ingresa una cantidad válida');return;}
      if(qty>selProd.stock){showToast&&showToast('⚠️ Stock insuficiente (hay '+selProd.stock+' '+selProd.unidad+')');return;}
      var obs=(document.getElementById('fx-obs')||{}).value||'Uso restaurante';
      var hora=new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
      var hoyStr2=typeof hoy==='function'?hoy():new Date().toISOString().slice(0,10);
      var S=window.S||{};

      // Descontar del inventario
      var prod=(S.productos||[]).find(function(p){return p.id===selProd.id;});
      var stockAntes=selProd.stock;
      var stockDespues=Math.max(0,stockAntes-qty);
      if(prod){
        prod.stock=stockDespues;
        prod.cant=stockDespues;
        if(typeof firebase!=='undefined'&&firebase.database)
          firebase.database().ref('inventario/productos/'+selProd.id).update({stock:stockDespues,cant:stockDespues});
      }

      // Guardar transferencia
      var entrada={
        prodId:selProd.id,nombre:selProd.nombre,cantidad:qty,unidad:selProd.unidad,
        costo:qty*selProd.costo,precioVenta:qty*selProd.precio,
        obs:obs,motivo:obs,hora:hora,fecha:hoyStr2,ts:Date.now(),
        usuario:window.currentUser?currentUser.nombre:''
      };
      if(!S.transfsRest) S.transfsRest={};
      if(!S.transfsRest[hoyStr2]) S.transfsRest[hoyStr2]=[];
      S.transfsRest[hoyStr2].push(entrada);

      if(typeof firebase!=='undefined'&&firebase.database){
        firebase.database().ref('transfsRest/'+hoyStr2).push(entrada);
        // Guardar en historialInventario/{prodId} — esto es lo que muestra el Historial por Producto
        firebase.database().ref('historialInventario/'+selProd.id).push({
          prodId:selProd.id,nombre:selProd.nombre,
          cantidad:-(qty),unidad:selProd.unidad,
          stockAntes:stockAntes,stockDespues:stockDespues,
          motivo:'🍽️ Transferencia al restaurante'+(obs&&obs!=='Uso restaurante'?' — '+obs:''),
          origen:'restaurante',
          usuario:window.currentUser?currentUser.nombre:'',
          hora:hora,fecha:hoyStr2,ts:Date.now()
        });
        // Guardar en restaurante/log para que el Historial por Día lo muestre
        var logKey=hoyStr2.replace(/-/g,'_');
        firebase.database().ref('restaurante/log/'+logKey).push({
          tipo:'rapido',
          prodId:selProd.id,nombre:selProd.nombre,cantidad:qty,unidad:selProd.unidad,
          costo:qty*selProd.costo,precioVenta:qty*selProd.precio,
          obs:obs,hora:hora,fecha:hoyStr2,ts:Date.now(),
          usuario:window.currentUser?currentUser.nombre:''
        });
        // Registrar en Bitácora general con tipo restaurante
        if(window.currentUser){
          firebase.database().ref('inventario/bitacora').push({
            tipo:'restaurante',
            detalle:'🍽️ Restaurante: '+qty+' '+selProd.unidad+' de '+selProd.nombre+' · Costo: '+fmt(qty*selProd.costo),
            userId:currentUser.id,userName:currentUser.nombre,
            userEmoji:currentUser.emoji||'🍽️',userColor:currentUser.color||'#1B6B35',
            ts:Date.now(),fecha:new Date().toLocaleString('es-CO')
          });
        }
      }

      showToast&&showToast('✅ '+qty+' '+selProd.unidad+' de '+selProd.nombre+' transferido');
      selProd=null;
      setTimeout(renderRest, 300);
    };
  }
})();
