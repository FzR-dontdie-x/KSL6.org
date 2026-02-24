const fs = require('fs').promises;
const path = require('path');

(async function(){
    const root = path.resolve(__dirname, '..');
    const bulletinsDir = path.join(root, 'Bulletins');
    const outFile = path.join(root, 'bulletins.html');

    const months = {
        january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11
    };

    function parseDateFromFilename(name){
        const m = name.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
        if(m){
            const month = months[m[1].toLowerCase()];
            const year = parseInt(m[2],10);
            return new Date(year, month, 1);
        }
        const y = name.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
        if(y) return new Date(parseInt(y[1],10), parseInt(y[2],10)-1, parseInt(y[3],10));
        const y2 = name.match(/(\d{4})/);
        if(y2) return new Date(parseInt(y2[1],10),0,1);
        return null;
    }

    function formatDate(d){
        if(!d) return '';
        const opts = { year: 'numeric', month: 'long' };
        return d.toLocaleDateString(undefined, opts);
    }

    try{
        const files = await fs.readdir(bulletinsDir);
        const coverFiles = await fs.readdir(path.join(bulletinsDir, 'Bulletin covers'));
        const bulletins = files.filter(f=>/\.pdf$/i.test(f)).map(f=>({ filename: f, url: `Bulletins/${encodeURIComponent(f)}`, date: parseDateFromFilename(f) }));

        // Function to find cover for a bulletin
        function findCover(bulletin) {
            if (!bulletin.date) return null;
            const year = bulletin.date.getFullYear();
            const month = bulletin.date.getMonth();
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const shortMonth = monthNames[month];
            // Look for cover_jan_2026.PNG or Feb_2026.PNG etc.
            const possibleNames = [
                `cover_${shortMonth}_${year}.PNG`,
                `cover_${shortMonth}_${year}.png`,
                `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)}_${year}.PNG`,
                `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)}_${year}.png`
            ];
            for (const name of possibleNames) {
                if (coverFiles.includes(name)) {
                    return `Bulletins/Bulletin covers/${encodeURIComponent(name)}`;
                }
            }
            return null;
        }

        bulletins.forEach(b => b.cover = findCover(b));

        bulletins.sort((a,b)=>{
            if(a.date && b.date) return b.date - a.date;
            if(a.date) return -1;
            if(b.date) return 1;
            return a.filename.localeCompare(b.filename);
        });

        const itemsHtml = bulletins.map(item => {
            const dateLabel = item.date ? formatDate(item.date) : item.filename;
            const coverHtml = item.cover ? `<img src="${item.cover}" alt="Bulletin cover" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 12px;">\n                    ` : '';
            return `                <div class="card">\n                    ${coverHtml}<h3>${escapeHtml(dateLabel)}</h3>\n                    <p>${escapeHtml(item.filename)}</p>\n                    <a class="bulletin-link" href="${item.url}" target="_blank" rel="noopener">Open Bulletin (PDF)</a>\n                </div>`;
        }).join('\n');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>King Solomon Lodge #6 - Lodge Bulletins</title>
    <link rel="icon" type="image/x-icon" href="logo.jpg">
    <style>
        /* Copied from index.html for consistent visuals */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .logo-section { display: flex; align-items: center; gap: 20px; }
        .logo { width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .site-title h1 { font-size: 28px; margin-bottom: 5px; }
        .site-title p { font-size: 14px; opacity: 0.9; }
        nav { background: #0f3460; padding: 15px 0; position: sticky; top: 0; z-index: 100; }
        #nav-toggle { display: none; }
        nav ul { list-style: none; display: flex; justify-content: center; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; padding: 0 20px; gap: 10px; }
        nav a { color: #fff; text-decoration: none; padding: 10px 20px; display: block; transition: background 0.3s; border-radius: 4px; }
        nav a:hover { background: #1a1a2e; }
        .hero { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23234567" width="1200" height="600"/></svg>'); background-size: cover; background-position: center; color: #fff; text-align: center; padding: 80px 20px; }
        .hero h2 { font-size: 36px; margin-bottom: 12px; }
        .hero p { font-size: 18px; max-width: 800px; margin: 0 auto 10px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
        .section { margin-bottom: 60px; }
        .section h2 { font-size: 32px; color: #1a1a2e; margin-bottom: 20px; border-bottom: 3px solid #0f3460; padding-bottom: 10px; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .card h3 { color: #0f3460; font-size: 20px; margin-bottom: 12px; }
        .card p { color: #666; }
        .bulletin-link { display: inline-block; margin-top: 10px; color: #0f3460; text-decoration: none; font-weight: 600; }
        .bulletin-link:hover { color: #1a1a2e; }
        .cta-button { display: inline-block; background: #0f3460; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .cta-button:hover { background: #1a1a2e; }
        footer { background: #1a1a2e; color: #fff; text-align: center; padding: 40px 20px; margin-top: 60px; }
        @media (max-width: 768px) { .hero { padding: 60px 20px; } nav ul { display: none; flex-direction: column; align-items: stretch; } nav.open ul { display: flex; } #nav-toggle { display: block; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); } }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo-section">
                <div class="logo"><img src="logo.jpg" alt="King Solomon Lodge #6 logo"></div>
                <div class="site-title">
                    <h1>King Solomon Lodge #6</h1>
                    <p>Free &amp; Accepted Masons - Gallatin, Tennessee</p>
                </div>
            </div>
        </div>
    </header>
    <nav>
        <button id="nav-toggle" aria-expanded="false" aria-label="Toggle navigation">☰</button>
        <ul>
            <li><a href="index.html#home">Home</a></li>
            <li><a href="index.html#about">About Us</a></li>
            <li><a href="bulletins.html">Lodge Bulletins</a></li>
            <li><a href="index.html#history">History</a></li>
            <li><a href="index.html#officers">Officers</a></li>
            <li><a href="index.html#membership">Membership</a></li>
            <li><a href="index.html#socials">Socials</a></li>
            <li><a href="index.html#contact">Contact</a></li>
        </ul>
    </nav>

    <div class="hero">
        <h2>Lodge Bulletins</h2>
        <p>Browse the latest lodge bulletins — newest first. Click any bulletin to open the PDF in a new tab.</p>
    </div>

    <div class="container">
        <section id="bulletins" class="section">
            <h2>Lodge Bulletins</h2>
            <p>Below are our lodge bulletins. They are ordered with the newest listed first.</p>

            <div id="bulletin-container" class="card-grid" aria-live="polite">
${itemsHtml}
            </div>

            <p style="margin-top: 20px;"><a class="cta-button" href="index.html">Back to Home</a></p>
        </section>
    </div>

    <footer>
        <p>&copy; 2026 King Solomon Lodge #6, F. &amp; A.M.</p>
        <p>354 E Main Street, Gallatin, TN 37066</p>
        <p><a href="mailto:info@ksl6.org">info@ksl6.org</a> | (615) 461-5712</p>
        <p>www.ksl6.org</p>
        <p style="margin-top: 20px;">A Founding Lodge of the <a href="http://www.grandlodge-tn.org" target="_blank">Grand Lodge of Tennessee</a></p>
        <p>Brotherly Love • Relief • Truth</p>
    </footer>

    <script>
        // Small nav toggle behavior copied from index.html
        (function(){
            const nav = document.querySelector('nav');
            const toggle = document.getElementById('nav-toggle');
            if(!nav || !toggle) return;

            function setExpanded(val){
                toggle.setAttribute('aria-expanded', String(val));
                if(val) nav.classList.add('open'); else nav.classList.remove('open');
            }

            toggle.addEventListener('click', (e)=>{
                const isOpen = nav.classList.contains('open');
                setExpanded(!isOpen);
            });

            document.addEventListener('click', (e)=>{
                if(!nav.classList.contains('open')) return;
                if(e.target.closest('nav')) return;
                setExpanded(false);
            });

            document.addEventListener('keydown', (e)=>{
                if(e.key === 'Escape') setExpanded(false);
            });
        })();
    </script>
</body>
</html>`;

        await fs.writeFile(outFile, html, 'utf8');
        console.log(`Generated ${outFile} with ${bulletins.length} bulletins`);
    }catch(err){
        console.error('Error generating bulletins:', err);
        process.exitCode = 1;
    }

    function escapeHtml(str){
        return String(str).replace(/[&<>"']/g, (s)=>({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
    }
})();