fetch('data.json')
  .then(r => r.json())
  .then(data => {
    const allMembers = [...new Set(data.flatMap(d => [...d.members, ...(d.bd || [])]))].sort();
    document.getElementById('memberCount').textContent = allMembers.length;

    let activeMembers = new Set();

    function renderChips() {
      const container = document.getElementById('memberChips');
      container.innerHTML = allMembers.map(m => {
        const count = data.filter(d => d.members.includes(m) || (d.bd && d.bd.includes(m))).length;
        const active = activeMembers.has(m) ? ' active' : '';
        return `<span class="chip${active}" onclick="toggleMember('${m}')">${m}<span class="chip-count">${count}</span></span>`;
      }).join('');
    }

    function renderList() {
      const list = document.getElementById('rankingList');
      const search = document.getElementById('searchBox').value.toLowerCase().trim();

      let visibleCount = 0;
      let html = '';

      data.forEach((d, i) => {
        const allInSetlist = [...d.members, ...(d.bd || [])];
        let show = true;

        if (activeMembers.size > 0) {
          show = [...activeMembers].some(am => allInSetlist.includes(am));
        }

        if (show && search) {
          const haystack = [d.title, ...allInSetlist].join(' ').toLowerCase();
          show = haystack.includes(search);
        }

        if (show) visibleCount++;

        const highlightClass = (activeMembers.size > 0 && show) ? ' highlight' : '';
        const hiddenClass = show ? '' : ' hidden';

        const membersHtml = d.members.map(m => {
          const isHighlighted = activeMembers.has(m) || (search && m.toLowerCase().includes(search));
          const isCenter = d.center === m;
          const classes = ['member-tag'];
          if (isCenter) classes.push('center-member');
          if (isHighlighted) classes.push('highlight-member');
          return `<span class="${classes.join(' ')}">${m}</span>`;
        }).join('');

        const bdHtml = d.bd ? `<div class="bd-section">
          <span class="bd-label">BD</span>
          <div class="bd-members">${d.bd.map(m => {
            const isHl = activeMembers.has(m) || (search && m.toLowerCase().includes(search));
            return `<span class="bd-member-tag${isHl ? ' highlight-member' : ''}">${m}</span>`;
          }).join('')}</div>
        </div>` : '';

        html += `<div class="rank-card${highlightClass}${hiddenClass}" style="animation-delay: ${visibleCount * 0.03}s">
          <div class="rank-num">${d.rank}</div>
          <div class="rank-content">
            <div class="rank-title-group">
              <div class="rank-title">${d.title}</div>
              <div class="rank-id-title">${d.idTitle}</div>
            </div>
            <div class="rank-members">${membersHtml}</div>
            ${bdHtml}
          </div>
        </div>`;
      });

      list.innerHTML = html;

      const clearBtn = document.getElementById('clearBtn');
      if (activeMembers.size > 0 || search) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }

      const empty = document.getElementById('emptyState');
      empty.classList.toggle('show', visibleCount === 0);
    }

    window.toggleMember = function(name) {
      if (activeMembers.has(name)) {
        activeMembers.delete(name);
      } else {
        activeMembers.add(name);
      }
      renderChips();
      renderList();
    };

    window.clearFilter = function() {
      activeMembers.clear();
      document.getElementById('searchBox').value = '';
      renderChips();
      renderList();
    };

    // Search with debounce
    let debounceTimer;
    document.getElementById('searchBox').addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderList, 120);
    });

    // Init
    renderChips();
    renderList();
  });
