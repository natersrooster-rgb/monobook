document.addEventListener('DOMContentLoaded', () => {
    const postBtn = document.getElementById('postBtn');
    const postInput = document.getElementById('postInput');
    const userInput = document.getElementById('userInput');
    const filterInput = document.getElementById('filterInput');
    const charCount = document.getElementById('charCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const decayCheckbox = document.getElementById('decayCheckbox');
    const feed = document.getElementById('feed');
    const feedTitle = document.getElementById('feedTitle');

    const MAX_CHARS = 280;

    // Load initial states from LocalStorage Architecture
    let savedPosts = JSON.parse(localStorage.getItem('monoNetworkPosts')) || [];
    let followedUsers = JSON.parse(localStorage.getItem('monoNetworkFollows')) || [];

    // Initialize Global Lifespan Loop for the unique Volatile Decay Feature
    setInterval(processNetworkDecay, 1000);

    renderAllPosts();

    // Track Character Capacity Limits
    postInput.addEventListener('input', () => {
        const len = postInput.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.style.color = len > MAX_CHARS ? '#FF3B30' : '#666666';
        postBtn.disabled = len > MAX_CHARS;
        postBtn.style.opacity = len > MAX_CHARS ? '0.5' : '1';
    });

    // Real-Time Hashtag Isolation Filtering Engine
    filterInput.addEventListener('input', () => {
        renderAllPosts();
    });

    // Main Social Feed Broadcast Logic
    postBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        let user = userInput.value.trim();
        
        if (text === '' || text.length > MAX_CHARS) return;
        if (!user.startsWith('@')) user = '@' + user;

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' // ' + now.toLocaleDateString();
        
        // Extrapolate #Hashtags using string matching arrays
        const words = text.split(/\s+/);
        const tags = words.filter(w => w.startsWith('#')).map(w => w.toLowerCase().replace(/[^a-z0-9#]/g, ''));

        const newPost = {
            id: 'node_' + Date.now() + Math.random().toString(36).substr(2, 4),
            user: user,
            text: text,
            timestamp: timestamp,
            likes: 0,
            tags: tags,
            comments: [],
            isVolatile: decayCheckbox.checked,
            bornAt: Date.now(),
            lifespanMs: 120000 // 2 Minutes volatile ticking down window
        };

        savedPosts.unshift(newPost);
        updateStorage();
        renderAllPosts();

        // Reset inputs
        postInput.value = '';
        decayCheckbox.checked = false;
        charCount.textContent = `0 / ${MAX_CHARS}`;
    });

    // Delegate Event Processing (Likes, Deletes, Follows, & Comment Generation)
    feed.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-id');
        if (!postId) return;

        const targetPost = savedPosts.find(p => p.id === postId);

        if (e.target.classList.contains('like-action') && targetPost) {
            targetPost.likes++;
            updateStorage();
            e.target.textContent = `[+] LIKE (${targetPost.likes})`;
        } 
        
        else if (e.target.classList.contains('delete-action')) {
            savedPosts = savedPosts.filter(p => p.id !== postId);
            updateStorage();
            renderAllPosts();
        } 
        
        else if (e.target.classList.contains('follow-action') && targetPost) {
            const index = followedUsers.indexOf(targetPost.user);
            if (index === -1) {
                followedUsers.push(targetPost.user);
            } else {
                followedUsers.splice(index, 1);
            }
            localStorage.setItem('monoNetworkFollows', JSON.stringify(followedUsers));
            renderAllPosts();
        } 
        
        else if (e.target.classList.contains('comment-btn') && targetPost) {
            const commentInput = document.getElementById(`c_input_${postId}`);
            const commentText = commentInput.value.trim();
            let cUser = userInput.value.trim();
            if (!cUser.startsWith('@')) cUser = '@' + cUser;

            if (commentText !== '') {
                targetPost.comments.push({
                    user: cUser,
                    text: commentText
                });
                updateStorage();
                renderAllPosts();
            }
        }
    });

    // Unique Decay Tracking Logic Matrix
    function processNetworkDecay() {
        let changed = false;
        const now = Date.now();

        savedPosts = savedPosts.filter(post => {
            if (!post.isVolatile) return true;
            const age = now - post.bornAt;
            if (age >= post.lifespanMs) {
                changed = true;
                return false; // Erase from database
            }
            return true;
        });

        if (changed) {
            updateStorage();
        }
        
        // Dynamically alter layout visual blur states without fully triggering screen rewrites
        savedPosts.forEach(post => {
            if (post.isVolatile) {
                const el = document.getElementById(post.id);
                if (el) {
                    const age = now - post.bornAt;
                    const ratio = age / post.lifespanMs;
                    el.className = 'post'; // Reset
                    if (ratio > 0.75) el.classList.add('decaying-critical');
                    else if (ratio > 0.4) el.classList.add('decaying-warn');
                    else el.classList.add('decaying-fine');
                }
            }
        });
    }

    function renderAllPosts() {
        const filterTag = filterInput.value.trim().toLowerCase();
        feedTitle.textContent = filterTag ? `Isolating tag: ${filterTag}` : 'Live Feed';

        feed.innerHTML = '';
        
        // Filter content conditionally based on user text constraints
        const targetedDisplayPosts = savedPosts.filter(post => {
            if (!filterTag) return true;
            return post.tags.some(t => t.includes(filterTag));
        });

        if (targetedDisplayPosts.length === 0) {
            feed.innerHTML = '<div style="color: #444; font-size: 0.9rem;">No matching broadcasts found.</div>';
            return;
        }
        
        targetedDisplayPosts.forEach(post => {
            const isFollowing = followedUsers.includes(post.user);
            const followText = isFollowing ? '[✓] FOLLOWING' : '[+] FOLLOW';
            const followClass = isFollowing ? 'action-link follow-action active-follow' : 'action-link follow-action';

            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.id = post.id;
            
            // Build comments HTML block layout inside rendering engine loop
            let commentsHtml = '';
            post.comments.forEach(c => {
                commentsHtml += `
                    <div class="comment-item">
                        <span class="comment-user">${escapeHtml(c.user)}:</span>
                        <span class="comment-text">${escapeHtml(c.text)}</span>
                    </div>
                `;
            });

            // Format body content parsing to visually separate standard items from dynamic hash links
            const highlightedText = escapeHtml(post.text).replace(/(#\w+)/g, '<span class="hashtag">\$1</span>');

            postElement.innerHTML = `
                <div class="post-meta">
                    <div class="user-badge-wrapper">
                        <span class="post-user">${escapeHtml(post.user)}</span>
                        <button class="${followClass}" data-id="${post.id}">${followText}</button>
                    </div>
                    <span class="post-time">${post.timestamp} ${post.isVolatile ? '⚠️ [VOLATILE]' : ''}</span>
                </div>
                <div class="post-content">${highlightedText}</div>
                <div class="post-actions">
                    <button class="action-link like-action" data-id="${post.id}">[+] Like (${post.likes})</button>
                    <button class="action-link delete-action" data-id="${post.id}">[-] Delete</button>
                </div>
                
                <div class="comments-section">
                    <div class="comment-list">${commentsHtml}</div>
                    <div class="comment-input-row">
                        <input type="text" id="c_input_${post.id}" placeholder="Write a comment down the line...">
                        <button class="button comment-btn" data-id="${post.id}">Reply</button>
                    </div>
                </div>
            `;
            feed.appendChild(postElement);
        });
    }

    function updateStorage() {
        localStorage.setItem('monoNetworkPosts', JSON.stringify(savedPosts));
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});
