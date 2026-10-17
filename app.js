document.addEventListener('DOMContentLoaded', () => {
    const postBtn = document.getElementById('postBtn');
    const postInput = document.getElementById('postInput');
    const userInput = document.getElementById('userInput');
    const charCount = document.getElementById('charCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const feed = document.getElementById('feed');

    const MAX_CHARS = 280;

    // Load initial data stack
    let savedPosts = JSON.parse(localStorage.getItem('monoNetworkPosts')) || [];
    renderAllPosts();

    // Track Character Caps
    postInput.addEventListener('input', () => {
        const len = postInput.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        
        if (len > MAX_CHARS) {
            charCount.style.color = '#FF3B30';
            postBtn.disabled = true;
            postBtn.style.opacity = '0.5';
        } else {
            charCount.style.color = '#666666';
            postBtn.disabled = false;
            postBtn.style.opacity = '1';
        }
    });

    // Broadcast Node
    postBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        let user = userInput.value.trim();
        
        if (text === '' || text.length > MAX_CHARS) return;
        if (!user.startsWith('@')) user = '@' + user;

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' // ' + now.toLocaleDateString();
        
        // Structure full post node metadata
        const newPost = {
            id: 'node_' + Date.now() + Math.random().toString(36).substr(2, 4),
            user: user,
            text: text,
            timestamp: timestamp,
            likes: 0
        };

        savedPosts.unshift(newPost);
        updateStorage();
        renderAllPosts();

        // Cleanup
        postInput.value = '';
        charCount.textContent = `0 / ${MAX_CHARS}`;
    });

    // Delegate Global Feed Interactions (Likes & Deletes)
    feed.addEventListener('click', (e) => {
        if (!e.target.classList.contains('action-link')) return;
        
        const postId = e.target.getAttribute('data-id');

        if (e.target.classList.contains('like-action')) {
            // Incremental Like Logic
            const targetPost = savedPosts.find(p => p.id === postId);
            if (targetPost) {
                targetPost.likes++;
                updateStorage();
                e.target.textContent = `[+] LIKE (${targetPost.likes})`;
            }
        } 
        
        else if (e.target.classList.contains('delete-action')) {
            // Filter Specific Target Nodes out
            savedPosts = savedPosts.filter(p => p.id !== postId);
            updateStorage();
            renderAllPosts();
        }
    });

    // Wipe Total History Engine
    clearAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to wipe all records from the current node network?")) {
            savedPosts = [];
            updateStorage();
            renderAllPosts();
        }
    });

    function renderAllPosts() {
        feed.innerHTML = '';
        if (savedPosts.length === 0) {
            feed.innerHTML = '<div style="color: #444; font-size: 0.9rem;">Network feed is empty. Awaiting broadcasts...</div>';
            return;
        }
        
        savedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <div class="post-meta">
                    <span class="post-user">${escapeHtml(post.user)}</span>
                    <span class="post-time">${post.timestamp}</span>
                </div>
                <div class="post-content">${escapeHtml(post.text)}</div>
                <div class="post-actions">
                    <button class="action-link like-action" data-id="${post.id}">[+] Like (${post.likes})</button>
                    <button class="action-link delete-action" data-id="${post.id}">[-] Delete</button>
                </div>
            `;
            feed.appendChild(postElement);
        });
    }

    function updateStorage() {
        localStorage.setItem('monoNetworkPosts', JSON.stringify(savedPosts));
    }

    // Basic XSS string escaping safety feature
    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});
