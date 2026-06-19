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

    // Cargar acumulado desde Firebase y luego renderizar
    var db=window.firebase&&window.firebase.database?window.firebase.database():null;
    if(db){
      db.ref('restauranteAcumulado').once('value').then(function(snap){
        var acum=snap.exists()?snap.val():{costoTotal:0,ventaTotal:0,desde:hoyStr,pagos:[]};
        renderRestConAcum(el,S,hoyStr,transfers,costoHoy,ventaHoy,acum);
      }).catch(function(){ renderRestConAcum(el,S,hoyStr,transfers,costoHoy,ventaHoy,{costoTotal:0,ventaTotal:0,desde:hoyStr,pagos:[]}); });
    } else {
      renderRestConAcum(el,S,hoyStr,transfers,costoHoy,ventaHoy,{costoTotal:0,ventaTotal:0,desde:hoyStr,pagos:[]});
    }
  }

  function renderRestConAcum(el,S,hoyStr,transfers,costoHoy,ventaHoy,acum){
    var h='<div style="padding:4px 0 100px">';
    h+='<div style="background:linear-gradient(135deg,#1a3a2a,#0d2318);color:#fff;padding:16px;border-radius:16px;margin-bottom:14px;display:flex;align-items:center;gap:12px"><div style="font-size:32px">🍽️</div><div><div style="font-size:15px;font-weight:700">Transferencias al Restaurante</div><div style="font-size:11px;opacity:.7">Descuenta del inventario automáticamente</div></div></div>';

    // KPIs de hoy
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">HOY</div><div style="font-size:22px;font-weight:700;color:#1F4E79">'+transfers.length+'</div></div>';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">COSTO HOY</div><div style="font-size:13px;font-weight:700;color:#B71C1C">'+fmt(costoHoy)+'</div></div>';
    h+='<div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #ece6db"><div style="font-size:9px;color:#888">VENTA HOY</div><div style="font-size:13px;font-weight:700;color:#1E5631">'+fmt(ventaHoy)+'</div></div>';
    h+='</div>';

    // Acumulado desde último pago
    var esAdminSup=window.currentUser&&(currentUser.rol==='admin'||currentUser.rol==='supervisor');
    var diasDesde=Math.max(0,Math.round((new Date(hoyStr)-new Date(acum.desde||hoyStr))/(1000*60*60*24)));

    // ── Panel acumulado (fondo oscuro) ──
    h+='<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:16px;margin-bottom:14px;color:#fff">';
    h+='<div style="font-size:13px;font-weight:700;color:#f0cc7a;margin-bottom:2px">📊 Acumulado período actual</div>';
    h+='<div style="font-size:10px;opacity:.6;margin-bottom:12px">Desde '+(acum.desde||hoyStr)+' · '+diasDesde+' día'+(diasDesde!==1?'s':'')+' sin corte</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
    h+='<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:9px;opacity:.6;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Costo acumulado</div><div style="font-size:20px;font-weight:700;color:#ef9a9a">'+fmt(acum.costoTotal||0)+'</div></div>';
    h+='<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:9px;opacity:.6;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Venta acumulada</div><div style="font-size:20px;font-weight:700;color:#a5d6a7">'+fmt(acum.ventaTotal||0)+'</div></div>';
    h+='</div>';
    if(esAdminSup){
      h+='<button id="fx-btn-pago" style="width:100%;padding:13px;border-radius:11px;border:none;background:#D4A843;color:#111;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:0">💰 Registrar Pago / Cerrar Período</button>';
    } else {
      h+='<div style="padding:10px;border-radius:10px;background:rgba(255,255,255,.07);text-align:center;font-size:11px;opacity:.5">🔒 Solo Admin o Supervisor puede registrar pagos</div>';
    }
    h+='</div>';

    // ── Panel de consulta por período (fondo claro, separado) ──
    h+='<div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid #ece6db">';
    h+='<div style="font-size:13px;font-weight:700;color:#1F4E79;margin-bottom:12px">🔍 Consultar consumo por período</div>';
    h+='<div style="display:flex;gap:6px;margin-bottom:10px">';
    h+='<button class="fx-chip" data-per="semana" style="flex:1;padding:8px 4px;border-radius:9px;border:2px solid #ddd;background:#f5f5f5;color:#555;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">📅 Semana</button>';
    h+='<button class="fx-chip" data-per="mes" style="flex:1;padding:8px 4px;border-radius:9px;border:2px solid #ddd;background:#f5f5f5;color:#555;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🗓️ Mes</button>';
    h+='<button class="fx-chip" data-per="custom" style="flex:1;padding:8px 4px;border-radius:9px;border:2px solid #ddd;background:#f5f5f5;color:#555;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✏️ Fechas</button>';
    h+='</div>';
    h+='<div id="fx-filtro-custom" style="display:none;margin-bottom:10px">';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
    h+='<div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:4px">DESDE</div><input type="date" id="fx-desde" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:12px;font-family:inherit;box-sizing:border-box" value="'+(acum.desde||hoyStr)+'" max="'+hoyStr+'"></div>';
    h+='<div><div style="font-size:9px;font-weight:700;color:#888;margin-bottom:4px">HASTA</div><input type="date" id="fx-hasta" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:12px;font-family:inherit;box-sizing:border-box" value="'+hoyStr+'" max="'+hoyStr+'"></div>';
    h+='</div>';
    h+='<button id="fx-btn-filtrar" style="width:100%;padding:10px;border-radius:9px;border:none;background:#1F4E79;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Ver período personalizado</button>';
    h+='</div>';
    h+='<div id="fx-periodo-result"></div>';
    h+='</div>';

    // ── Historial de períodos pagados (se rellena con Firebase) ──
    h+='<div id="fx-historial-pagos" style="margin-bottom:14px"></div>';

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
      var esAdminSupRevert=window.currentUser&&(currentUser.rol==='admin'||currentUser.rol==='supervisor');
      h+='<div style="font-size:16px;font-weight:700;margin:4px 0 10px;color:#111">📋 Hoy — <span style="color:#D4A843">'+transfers.length+' transferencia'+(transfers.length!==1?'s':'')+'</span></div>';
      h+='<div style="background:#fff;border-radius:14px;padding:4px 14px 14px;border:1px solid #ece6db;margin-bottom:14px">';
      transfers.slice().reverse().forEach(function(t,idxRev){
        var usuarioColor=t.usuario?'#1F4E79':'#aaa';
        h+='<div style="padding:10px 0;border-bottom:1px solid #f5f0ea">';
        h+='<div style="display:flex;justify-content:space-between;align-items:flex-start">';
        h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#111">'+t.nombre+'</div>';
        h+='<div style="font-size:10px;color:#888;margin-top:2px">'+(t.hora||'')+' · '+(t.obs||t.motivo||'Uso restaurante')+'</div>';
        if(t.usuario) h+='<div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;background:#e8f0fe;border-radius:20px;padding:2px 8px"><span style="font-size:9px;color:#1F4E79;font-weight:700">👤 '+t.usuario+'</span></div>';
        h+='</div>';
        h+='<div style="text-align:right;flex-shrink:0;padding-left:10px"><div style="font-size:14px;font-weight:700;color:#B71C1C">−'+t.cantidad+' '+(t.unidad||'')+'</div><div style="font-size:10px;color:#888">'+fmt(t.costo||0)+'</div></div>';
        h+='</div>';
        if(esAdminSupRevert&&t._key){
          h+='<button class="fx-btn-revertir" data-key="'+t._key+'" data-fecha="'+hoyStr+'" style="margin-top:6px;padding:5px 10px;border-radius:7px;border:1px solid #B71C1C;background:transparent;color:#B71C1C;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit">↩️ Revertir esta transferencia</button>';
        }
        h+='</div>';
      });
      h+='</div>';
    }

    h+='</div>';
    el.innerHTML=h;

    // Chips de período
    document.querySelectorAll('.fx-chip').forEach(function(chip){
      chip.onclick=function(){
        document.querySelectorAll('.fx-chip').forEach(function(c){
          c.style.background='#f5f5f5';c.style.borderColor='#ddd';c.style.color='#555';
        });
        this.style.background='#1F4E79';this.style.borderColor='#1F4E79';this.style.color='#fff';
        var per=this.dataset.per;
        var customDiv=document.getElementById('fx-filtro-custom');
        if(per==='custom'){
          if(customDiv) customDiv.style.display='block';
          document.getElementById('fx-periodo-result').innerHTML='';
          return;
        }
        if(customDiv) customDiv.style.display='none';
        calcFxPeriodo(per,null,null);
      };
    });

    // Botones de revertir transferencia
    document.querySelectorAll('.fx-btn-revertir').forEach(function(btn){
      btn.onclick=function(){
        revertirTransferencia(this.dataset.key, this.dataset.fecha);
      };
    });

    // Botón filtrar personalizado
    var btnFiltrar=document.getElementById('fx-btn-filtrar');
    if(btnFiltrar) btnFiltrar.onclick=function(){
      var desde=(document.getElementById('fx-desde')||{}).value||hoyStr;
      var hasta=(document.getElementById('fx-hasta')||{}).value||hoyStr;
      calcFxPeriodo('custom',desde,hasta);
    };

    // Cargar historial de períodos pagados
    var db0=window.firebase&&window.firebase.database?window.firebase.database():null;
    if(db0){
      db0.ref('restaurantePagos').orderByChild('ts').limitToLast(5).once('value').then(function(snap){
        var pagos=[];
        if(snap.exists()) snap.forEach(function(c){pagos.push(c.val());});
        pagos.reverse();
        var histEl=document.getElementById('fx-historial-pagos');
        if(!histEl||!pagos.length) return;
        var hh='<div style="font-size:13px;font-weight:700;color:#1F4E79;margin-bottom:10px">🗂️ Períodos Pagados</div>';
        pagos.forEach(function(p){
          hh+='<div style="background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:8px;border:1px solid #ece6db;border-left:4px solid #D4A843">';
          hh+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
          hh+='<div style="font-size:11px;font-weight:700;color:#555">'+p.desde+' → '+p.hasta+'</div>';
          hh+='<div style="font-size:10px;color:#888">'+p.hora+' · '+(p.pagadoPor||'—')+'</div>';
          hh+='</div>';
          hh+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
          hh+='<div style="background:#fff5f5;border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:#888">Costo</div><div style="font-size:13px;font-weight:700;color:#B71C1C">'+fmt(p.costoTotal||0)+'</div></div>';
          hh+='<div style="background:#f0fff4;border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:#888">Venta equiv.</div><div style="font-size:13px;font-weight:700;color:#1E5631">'+fmt(p.ventaTotal||0)+'</div></div>';
          hh+='</div></div>';
        });
        histEl.innerHTML=hh;
      });
    }

    // Botón pago / reset acumulado
    var btnPago=document.getElementById('fx-btn-pago');
    if(btnPago) btnPago.onclick=function(){
      var db=window.firebase&&window.firebase.database?window.firebase.database():null;
      if(!db){showToast&&showToast('Sin conexión');return;}
      db.ref('restauranteAcumulado').once('value').then(function(snap){
        var acum=snap.exists()?snap.val():{costoTotal:0,ventaTotal:0,desde:hoyStr,pagos:[]};
        if(!acum.costoTotal&&!acum.ventaTotal){showToast&&showToast('No hay acumulado que registrar');return;}
        var confirmar=window.confirm('¿Registrar pago de '+fmt(acum.costoTotal)+' en costo ('+fmt(acum.ventaTotal)+' en venta) y reiniciar el conteo?');
        if(!confirmar) return;
        var histPago={
          fecha:hoyStr,hora:new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
          costoTotal:acum.costoTotal,ventaTotal:acum.ventaTotal,
          desde:acum.desde||hoyStr,hasta:hoyStr,
          pagadoPor:window.currentUser?currentUser.nombre:'—',
          ts:Date.now()
        };
        // Guardar en historial de pagos
        db.ref('restaurantePagos').push(histPago);
        // Registrar en bitácora
        if(window.currentUser){
          db.ref('inventario/bitacora').push({
            tipo:'restaurante',
            detalle:'💰 Pago registrado al restaurante · Costo: '+fmt(acum.costoTotal)+' · Venta: '+fmt(acum.ventaTotal)+' · Período: '+acum.desde+' → '+hoyStr,
            userId:currentUser.id,userName:currentUser.nombre,
            userEmoji:currentUser.emoji||'💰',userColor:currentUser.color||'#D4A843',
            ts:Date.now(),fecha:new Date().toLocaleString('es-CO')
          });
        }
        // Resetear acumulado
        db.ref('restauranteAcumulado').set({costoTotal:0,ventaTotal:0,desde:hoyStr,pagos:[]}).then(function(){
          showToast&&showToast('✅ Pago registrado y conteo reiniciado');
          setTimeout(renderRest,300);
        });
      });
    };

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

      var db=typeof firebase!=='undefined'&&firebase.database?firebase.database():null;

      // Descontar del inventario
      var prod=(S.productos||[]).find(function(p){return p.id===selProd.id;});
      var stockAntes=selProd.stock;
      var stockDespues=Math.max(0,stockAntes-qty);
      if(prod){
        prod.stock=stockDespues;
        prod.cant=stockDespues;
        if(db) db.ref('inventario/productos/'+selProd.id).update({stock:stockDespues,cant:stockDespues});
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
      if(db){
        var transfRef=db.ref('transfsRest/'+hoyStr2).push(entrada);
        entrada._key=transfRef.key;
        S.transfsRest[hoyStr2].push(entrada);
        // Guardar en historialInventario/{prodId} — esto es lo que muestra el Historial por Producto
        db.ref('historialInventario/'+selProd.id).push({
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
        db.ref('restaurante/log/'+logKey).push({
          tipo:'rapido',
          prodId:selProd.id,nombre:selProd.nombre,cantidad:qty,unidad:selProd.unidad,
          costo:qty*selProd.costo,precioVenta:qty*selProd.precio,
          obs:obs,hora:hora,fecha:hoyStr2,ts:Date.now(),
          usuario:window.currentUser?currentUser.nombre:''
        });
        // Actualizar acumulado global
        db.ref('restauranteAcumulado').once('value').then(function(snap){
          var acum=snap.exists()?snap.val():{costoTotal:0,ventaTotal:0,desde:hoyStr2,pagos:[]};
          acum.costoTotal=(acum.costoTotal||0)+(qty*selProd.costo);
          acum.ventaTotal=(acum.ventaTotal||0)+(qty*selProd.precio);
          if(!acum.desde) acum.desde=hoyStr2;
          db.ref('restauranteAcumulado').set(acum);
        });
        // Registrar en Bitácora general con tipo restaurante
        if(window.currentUser){
          db.ref('inventario/bitacora').push({
            tipo:'restaurante',
            detalle:'🍽️ Restaurante: '+qty+' '+selProd.unidad+' de '+selProd.nombre+' · Costo: '+fmt(qty*selProd.costo),
            userId:currentUser.id,userName:currentUser.nombre,
            userEmoji:currentUser.emoji||'🍽️',userColor:currentUser.color||'#1B6B35',
            ts:Date.now(),fecha:new Date().toLocaleString('es-CO')
          });
        }
      } else {
        S.transfsRest[hoyStr2].push(entrada);
      }

      showToast&&showToast('✅ '+qty+' '+selProd.unidad+' de '+selProd.nombre+' transferido');
      selProd=null;
      setTimeout(renderRest, 300);
    };
  }
  function calcFxPeriodo(per,desdeCustom,hastaCustom){
    var resEl=document.getElementById('fx-periodo-result');
    if(!resEl) return;
    resEl.innerHTML='<div style="font-size:11px;color:rgba(255,255,255,.5);padding:6px 0">Calculando...</div>';
    var hoyStr=typeof hoy==='function'?hoy():new Date().toISOString().slice(0,10);
    var desde,hasta=hoyStr;
    if(per==='semana'){
      var d=new Date();d.setDate(d.getDate()-d.getDay());
      desde=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    } else if(per==='mes'){
      var d2=new Date();
      desde=d2.getFullYear()+'-'+String(d2.getMonth()+1).padStart(2,'0')+'-01';
    } else {
      desde=desdeCustom||hoyStr; hasta=hastaCustom||hoyStr;
    }
    var db=window.firebase&&window.firebase.database?window.firebase.database():null;
    if(!db){resEl.innerHTML='<div style="font-size:11px;color:rgba(255,255,255,.4)">Sin conexión</div>';return;}
    // Generar lista de fechas en rango
    var fechas=[],cur=new Date(desde+'T12:00:00'),fin=new Date(hasta+'T12:00:00');
    while(cur<=fin&&fechas.length<60){
      fechas.push(cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0')+'-'+String(cur.getDate()).padStart(2,'0'));
      cur.setDate(cur.getDate()+1);
    }
    // Leer cada día de transfsRest
    Promise.all(fechas.map(function(f){return db.ref('transfsRest/'+f).once('value');}))
    .then(function(snaps){
      var totalCosto=0,totalVenta=0,byProd={};
      snaps.forEach(function(snap){
        if(!snap.exists()) return;
        snap.forEach(function(c){
          var t=c.val();
          totalCosto+=(t.costo||0);
          totalVenta+=(t.precioVenta||0);
          var k=t.nombre;
          if(!byProd[k]) byProd[k]={nombre:k,unidad:t.unidad||'',qty:0,costo:0};
          byProd[k].qty+=t.cantidad||0;
          byProd[k].costo+=(t.costo||0);
        });
      });
      if(!totalCosto&&!totalVenta){
        resEl.innerHTML='<div style="font-size:11px;color:rgba(255,255,255,.4);padding:6px 0">Sin movimientos en este período</div>';
        return;
      }
      var hh='<div style="background:rgba(255,255,255,.07);border-radius:10px;padding:10px;margin-top:4px">';
      hh+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">';
      hh+='<div style="text-align:center"><div style="font-size:9px;opacity:.6">Costo período</div><div style="font-size:16px;font-weight:700;color:#ef9a9a">'+fmt(totalCosto)+'</div></div>';
      hh+='<div style="text-align:center"><div style="font-size:9px;opacity:.6">Venta equiv.</div><div style="font-size:16px;font-weight:700;color:#a5d6a7">'+fmt(totalVenta)+'</div></div>';
      hh+='</div>';
      Object.values(byProd).sort(function(a,b){return b.costo-a.costo;}).slice(0,8).forEach(function(p){
        hh+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-top:1px solid rgba(255,255,255,.07)">';
        hh+='<span style="opacity:.8">'+p.nombre+'</span>';
        hh+='<span style="opacity:.6">'+Number(p.qty).toFixed(2)+' '+p.unidad+'</span>';
        hh+='<span style="color:#ef9a9a;font-weight:700">'+fmt(p.costo)+'</span>';
        hh+='</div>';
      });
      hh+='</div>';
      resEl.innerHTML=hh;
    }).catch(function(){
      resEl.innerHTML='<div style="font-size:11px;color:rgba(255,255,255,.4)">Error al cargar</div>';
    });
  }

  function revertirTransferencia(key, fecha){
    if(!key||!fecha){ showToast&&showToast('No se puede revertir: falta información'); return; }
    if(!window.currentUser||(currentUser.rol!=='admin'&&currentUser.rol!=='supervisor')){
      showToast&&showToast('Solo admin o supervisor puede revertir'); return;
    }
    var db=window.firebase&&window.firebase.database?window.firebase.database():null;
    if(!db){ showToast&&showToast('Sin conexión a Firebase'); return; }

    db.ref('transfsRest/'+fecha+'/'+key).once('value').then(function(snap){
      if(!snap.exists()){ showToast&&showToast('No se encontró la transferencia'); return; }
      var t=snap.val();
      var motivo=window.prompt('Motivo para revertir "'+t.nombre+'" ('+t.cantidad+' '+(t.unidad||'')+'):','Error al registrar');
      if(motivo===null) return; // cancelado
      if(!motivo.trim()){ showToast&&showToast('Debes ingresar un motivo'); return; }

      var S=window.S||{};
      var prod=(S.productos||[]).find(function(p){return p.id===t.prodId;});
      var stockAntes=prod?(prod.stock||0):0;
      var stockDespues=stockAntes+(t.cantidad||0);

      var updates={};
      // Devolver el stock al producto
      if(prod){
        prod.stock=stockDespues;
        prod.cant=stockDespues;
        updates['inventario/productos/'+t.prodId+'/stock']=stockDespues;
        updates['inventario/productos/'+t.prodId+'/cant']=stockDespues;
      }
      // Eliminar la transferencia
      updates['transfsRest/'+fecha+'/'+key]=null;

      db.ref().update(updates).then(function(){
        // Quitar del array local
        if(S.transfsRest&&S.transfsRest[fecha]){
          S.transfsRest[fecha]=S.transfsRest[fecha].filter(function(x){return x._key!==key;});
        }
        // Registrar la reversión en historialInventario
        if(prod){
          db.ref('historialInventario/'+t.prodId).push({
            prodId:t.prodId,nombre:t.nombre,
            cantidad:t.cantidad,unidad:t.unidad,
            stockAntes:stockAntes,stockDespues:stockDespues,
            motivo:'↩️ Reversión de transferencia al restaurante — '+motivo,
            origen:'restaurante_reversion',
            usuario:currentUser.nombre,
            hora:new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
            fecha:fecha,ts:Date.now()
          });
        }
        // Descontar del acumulado global
        db.ref('restauranteAcumulado').once('value').then(function(snapAcum){
          if(!snapAcum.exists()) return;
          var acum=snapAcum.val();
          acum.costoTotal=Math.max(0,(acum.costoTotal||0)-(t.costo||0));
          acum.ventaTotal=Math.max(0,(acum.ventaTotal||0)-(t.precioVenta||0));
          db.ref('restauranteAcumulado').set(acum);
        });
        // Bitácora
        db.ref('inventario/bitacora').push({
          tipo:'restaurante',
          detalle:'↩️ Reversión transferencia: '+t.cantidad+' '+(t.unidad||'')+' de '+t.nombre+' · Motivo: '+motivo,
          userId:currentUser.id,userName:currentUser.nombre,
          userEmoji:currentUser.emoji||'↩️',userColor:currentUser.color||'#B71C1C',
          ts:Date.now(),fecha:new Date().toLocaleString('es-CO')
        });
        showToast&&showToast('✅ Transferencia revertida — stock devuelto');
        setTimeout(renderRest, 300);
      }).catch(function(e){ showToast&&showToast('Error: '+e.message); });
    });
  }

})();
