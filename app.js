document.addEventListener('DOMContentLoaded', () => {
    const postBtn = document.getElementById('postBtn');
    const postInput = document.getElementById('postInput');
    const feed = document.getElementById('feed');

    postBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        
        if (text === '') return; // Don't post empty thoughts

        // Create the post structure
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Generate a crisp typographic timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' // ' + now.toLocaleDateString();

        postElement.innerHTML = `
            <div class="post-time">${timestamp}</div>
            <div class="post-content">${text}</div>
        `;

        // Prepend so newest posts are always on top
        feed.insertBefore(postElement, feed.firstChild);

        // Clear input box
        postInput.value = '';
    });
});
