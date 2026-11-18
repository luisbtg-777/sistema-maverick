import asyncio, json, os
from playwright.async_api import async_playwright
URL='file:///home/claude/sistema-maverick/mente-mv.html'
ok=0
def check(c,msg):
    global ok
    assert c, msg; ok+=1; print('✓',msg)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},accept_downloads=True)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(URL+'?hoy=2026-12-02&hora=13:24'); await pg.wait_for_timeout(300)
        check(await pg.locator('#hoy .dial').count()==1,'Hoy muestra el Dial')
        check('0/3' in await pg.locator('#hoy .dial').text_content(),'Dial arranca en 0/3')
        # cada hoja tiene ✕
        for bk in ['m','i','n','v','valores']:
            await pg.evaluate(f"__MM_UI.abrir('{bk}')"); await pg.wait_for_timeout(350)
            check(await pg.locator('#sheet [data-act=cerrar]').count()==1,f'hoja {bk} tiene ✕')
            await pg.click('#sheet [data-act=cerrar]'); await pg.wait_for_timeout(350)
            check(not await pg.locator('#sheet.on').count(),f'✕ cierra hoja {bk}')
        # completar 🧘 con valor y slider
        await pg.evaluate("__MM_UI.abrir('m')"); await pg.wait_for_timeout(350)
        await pg.click('#sheet [data-act=valor][data-i="3"]')
        sl=pg.locator('#sheet [data-slider]'); bb=await sl.bounding_box()
        await pg.mouse.click(bb['x']+bb['width']*0.99,bb['y']+15)
        await pg.click('#sheet [data-act=hecho]'); await pg.wait_for_timeout(450)
        st=await pg.evaluate("__MM_UI.S()")
        d=st['dias']['2026-12-02']['m']
        check(d['done'] and d['valor']==3 and d['pres']==5,'🧘 guarda hecho, valor (Osadía) y presencia 5')
        # timer
        await pg.evaluate("__MM_UI.abrir('n')"); await pg.wait_for_timeout(350)
        await pg.click('#sheet [data-timer=t] [data-act=timer]'); await pg.wait_for_timeout(1300)
        t=await pg.locator('#sheet [data-timer=t] .tt').text_content()
        check(t in ('2:59','2:58'),f'timer de la flama corre ({t})')
        check(await pg.locator('#sheet .flama.off').count()==0,'la flama se enciende al iniciar')
        await pg.click('#sheet [data-act=luna][data-i="3"]'); await pg.click('#sheet [data-act=set][data-k=emo][data-v=rechazo]')
        await pg.fill('#sheet [data-in="n.sep"]','Hubo una sensación de enojo cuando…')
        await pg.click('#sheet [data-act=sen][data-i="0"]')
        await pg.click('#sheet [data-act=hecho]'); await pg.wait_for_timeout(450)
        st=await pg.evaluate("__MM_UI.S()"); n=st['dias']['2026-12-02']['n']
        check(n['done'] and n['luna']==3 and n['emo']=='rechazo' and n['sep'].startswith('Hubo') and n['sen']==[0],'🌙 guarda luna, emoción, separación y Sen')
        await pg.evaluate("__MM_UI.abrir('i')"); await pg.wait_for_timeout(350)
        await pg.click('#sheet [data-act=set][data-k=orden][data-v=ok]'); await pg.click('#sheet [data-act=toggle][data-k=leido]')
        await pg.fill('#sheet [data-in="i.cita"]','El obstáculo es el camino')
        await pg.click('#sheet [data-act=hecho]'); await pg.wait_for_timeout(450)
        check('3/3' in await pg.locator('#hoy .dial').text_content() and 'SELLADO' in await pg.locator('#hoy .dial').text_content(),'Dial 3/3 · DÍA SELLADO')
        # in vivo
        await pg.evaluate("__MM_UI.abrir('v')"); await pg.wait_for_timeout(350)
        await pg.click('#sheet [data-act=ivluna][data-k=antes][data-i="1"]'); await pg.click('#sheet [data-act=ivdone]'); await pg.wait_for_timeout(450)
        st=await pg.evaluate("__MM_UI.S()"); v=st['dias']['2026-12-02']['v']
        check(v['done'] and v['emo']=='miedo' and v['antes']==1,'🔥 In Vivo guarda emoción y luna antes')
        # persistencia
        await pg.reload(); await pg.wait_for_timeout(400)
        check('3/3' in await pg.locator('#hoy .dial').text_content(),'persistencia tras recargar')
        # corazonada de ayer
        await pg.goto(URL+'?hoy=2026-12-03&hora=21:40'); await pg.wait_for_timeout(300)
        await pg.evaluate("__MM_UI.S().dias['2026-12-02'].n.corazon='Me va a llamar'"); 
        await pg.evaluate("__MM_UI.abrir('n')"); await pg.wait_for_timeout(350)
        await pg.click('#sheet [data-act=corazon][data-v=ok]'); await pg.wait_for_timeout(200)
        st=await pg.evaluate("__MM_UI.S()")
        check(st['dias']['2026-12-02']['n']['corazonRes']=='ok','corazonada de ayer se marca ✓')
        await pg.click('#sheet [data-act=cerrar]')
        # registro y camino
        await pg.click('[data-tab=registro]'); await pg.wait_for_timeout(300)
        txt=await pg.locator('#registro').inner_text()
        check('100%' in txt and 'El obstáculo es el camino' in txt,'Registro muestra corazonadas y citas')
        await pg.click('[data-tab=camino]'); await pg.wait_for_timeout(300)
        txt=await pg.locator('#camino').inner_text()
        check('30 nov → 27 dic' in txt and 'activa' in txt,'Camino: F1 30 nov → 27 dic activa')
        # export / import
        await pg.click('[data-tab=ajustes]'); await pg.wait_for_timeout(300)
        async with pg.expect_download() as dl: await pg.click('[data-act=export]')
        path=await (await dl.value).path(); data=json.load(open(path))
        check(data['key']=='mentemv_v1' and '2026-12-02' in data['state']['dias'],'exporta respaldo completo')
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(300)
        await pg.click('[data-tab=ajustes]')
        await pg.set_input_files('input[data-act=import]',path); await pg.wait_for_timeout(500)
        st=await pg.evaluate("__MM_UI.S()")
        check(st['dias']['2026-12-02']['m']['done'] and st['dias']['2026-12-02']['i']['cita']=='El obstáculo es el camino','importa respaldo sin perder datos')
        # migración: estado viejo con campos extra
        await pg.evaluate("localStorage.setItem('mentemv_v1', JSON.stringify({dias:{'2026-12-01':{m:{done:true}}},futuro:{x:1}}))"); await pg.reload(); await pg.wait_for_timeout(300)
        st=await pg.evaluate("__MM_UI.S()")
        check(st['futuro']['x']==1 and st['dias']['2026-12-01']['m']['done'],'migración conserva campos desconocidos')
        # localStorage bloqueado no rompe
        pg2=await ctx.new_page(); e2=[]; pg2.on('pageerror',lambda e: e2.append(str(e)))
        await pg2.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('bloqueado')}})")
        await pg2.goto(URL+'?hoy=2026-12-02'); await pg2.wait_for_timeout(300)
        check(not e2 and await pg2.locator('#hoy .dial').count()==1,'sin localStorage la app abre igual')
        # todas las fechas clave renderizan
        for d in ['2026-11-18','2026-11-30','2026-12-16','2026-12-24','2027-01-01','2027-01-08','2027-02-21','2027-06-01']:
            for tb in ['hoy','camino','registro','ajustes']:
                await pg.goto(URL+f'?hoy={d}&tab={tb}'); await pg.wait_for_timeout(120)
        check(not errs,f'sin errores JS en 32 combinaciones de fecha/pestaña {errs[:2]}')
        await b.close()
    print(f'\n{ok} pruebas de UI OK')
asyncio.run(main())
