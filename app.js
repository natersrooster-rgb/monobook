document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // UNIQUE FEATURE: Live Terminal Audio Synthesis Matrix
    // ----------------------------------------------------
    function playNetworkTone(type, pitchModifier = 1) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            const now = ctx.currentTime;

            if (type === 'broadcast') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } 
            else if (type === 'like') {
                osc.type = 'sine';
                const dynamicFreq = 600 + (pitchModifier * 30); 
                osc.frequency.setValueAtTime(dynamicFreq, now);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } 
            else if (type === 'delete') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(40, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            console.log("Audio system blocked by browser autoplay settings.");
        }
    }

    // Collect UI Nodes securely
    const postBtn = document.getElementById('postBtn');
    const postInput = document.getElementById('postInput');
    const userInput = document.getElementById('userInput');
    const filterInput = document.getElementById('filterInput');
    const charCount = document.getElementById('charCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const feed = document.getElementById('feed');
    const feedTitle = document.getElementById('feedTitle');

    // Stats UI Nodes
    const statHandle = document.getElementById('statHandle');
    const statLikes = document.getElementById('statLikes');
    const statFollowers = document.getElementById('statFollowers');

    const MAX_CHARS = 280;

    // Load initial states from LocalStorage Architecture
    let savedPosts = JSON.parse(localStorage.getItem('monoNetworkPosts')) || [];
    let followedUsers = JSON.parse(localStorage.getItem('monoNetworkFollows')) || [];

    // Initial Screen Compilation
    renderAllPosts();
    updateLiveDashboard();

    // Track Character Capacity Limits
    postInput.addEventListener('input', () => {
        const len = postInput.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.style.color = len > MAX_CHARS ? '#FF3B30' : '#666666';
        postBtn.disabled = len > MAX_CHARS;
        postBtn.style.opacity = len > MAX_CHARS ? '0.5' : '1';
    });

    // Handle profile handle updates
    userInput.addEventListener('input', () => {
        updateLiveDashboard();
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
        
        // Extrapolate #Hashtags
        const words = text.split(/\s+/);
        const tags = words.filter(w => w.startsWith('#')).map(w => w.toLowerCase().replace(/[^a-z0-9#]/g, ''));

        const newPost = {
            id: 'node_' + Date.now() + Math.random().toString(36).substr(2, 4),
            user: user,
            text: text,
            timestamp: timestamp,
            likes: 0,
            tags: tags,
            comments: []
        };

        savedPosts.unshift(newPost);
        updateStorage();
        
        // Play Unique Audio Sweep Chime
        playNetworkTone('broadcast');

        renderAllPosts();
        updateLiveDashboard();

        // Reset inputs cleanly
        postInput.value = '';
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
            
            // Play Dynamic Tone (goes up in pitch based on likes)
            playNetworkTone('like', targetPost.likes);

            e.target.textContent = `[+] LIKE (${targetPost.likes})`;
            updateLiveDashboard();
        } 
        
        else if (e.target.classList.contains('delete-action')) {
            savedPosts = savedPosts.filter(p => p.id !== postId);
            updateStorage();
            
            // Play Bass Drop frequency tone
            playNetworkTone('delete');

            renderAllPosts();
            updateLiveDashboard();
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
            updateLiveDashboard();
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
                commentInput.value = '';
                renderAllPosts();
            }
        }
    });

    // Wipe Total History Engine
    clearAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to wipe all records from the current node network?")) {
            savedPosts = [];
            followedUsers = [];
            localStorage.removeItem('monoNetworkFollows');
            updateStorage();
            
            playNetworkTone('delete');
            
            renderAllPosts();
            updateLiveDashboard();
        }
    });

    // Dynamic Live Dashboard Metrics Processor
    function updateLiveDashboard() {
        let activeUser = userInput.value.trim();
        if (!activeUser.startsWith('@')) activeUser = '@' + activeUser;

        statHandle.textContent = activeUser;

        // Calculate cumulative likes earned across the network by this handle
        const netLikes = savedPosts
            .filter(p => p.user.toLowerCase() === activeUser.toLowerCase())
            .reduce((total, p) => total + p.likes, 0);
        statLikes.textContent = netLikes;

        // Update total profiles user currently monitors
        statFollowers.textContent = followedUsers.length;
    }

    function renderAllPosts() {
        const filterTag = filterInput.value.trim().toLowerCase();
        feedTitle.textContent = filterTag ? `Isolating tag: ${filterTag}` : 'Live Feed';

        feed.innerHTML = '';
        
        const targetedDisplayPosts = savedPosts.filter(post => {
            if (!filterTag) return true;
            return post.tags.some(t => t.includes(filterTag));
        });

        if (targetedDisplayPosts.length === 0) {
            feed.innerHTML = '<div style="color: #444; font-size: 0.9rem; padding: 1rem 0;">No matching broadcasts found.</div>';
            return;
        }
        
        targetedDisplayPosts.forEach(post => {
            const isFollowing = followedUsers.includes(post.user);
            const followText = isFollowing ? '[✓] FOLLOWING' : '[+] FOLLOW';
            const followClass = isFollowing ? 'action-link follow-action active-follow' : 'action-link follow-action';

            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.id = post.id;
            
            let commentsHtml = '';
            post.comments.forEach(c => {
                commentsHtml += `
                    <div class="comment-item">
                        <span class="comment-user">${escapeHtml(c.user)}:</span>
                        <span class="comment-text">${escapeHtml(c.text)}</span>
                    </div>
                `;
            });

            // Highlight hashtags safely
Use code with caution.
const highlightedText = escapeHtml(post.text).replace(/(#\w+)/g, '$1');
postElement.innerHTML = `


${escapeHtml(post.user)}
${followText}

${post.timestamp}

${highlightedText}

[+] Like (${post.likes})
[-] Delete
${commentsHtml}


Reply


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
}); // <-- THIS MUST BE THE ABSOLUTE LAST LINE OF THE FILE
