

window.addEventListener("load", function () {

    window.pop_old = document.location.pathname;
    window.pop_new = '';

    window.onpopstate = function (event) {
        window.pop_new = document.location.pathname;

        if (pop_new != pop_old) startTransition(null, window.pop_new, window.pop_old, event)

        window.pop_old = pop_new; //save for the next interaction
    };


    window.addEventListener("click", start);


    function start(e) {
        const elm = e.currentTarget.document.activeElement
        const check = isLink(elm)
        if (check) {
            const internalRedirect = hasClass(elm, 'internal')
            if (internalRedirect) {
                const href = getHref(elm)
                if (href) {
                    e.preventDefault()
                    const currentPath = window.location.pathname
                    if (check) startTransition(elm, href, currentPath, e)
                }
            }
        }
    }


    function isLink(element) {
        if (element.tagName === 'a' || element.tagName === 'A') return true
        return false
    }

    function hasClass(elm, classname) {
        if (elm.classList.contains(classname)) return true
        return false
    }
    function getHref(e) { return e.getAttribute('href') }


    async function startTransition(link, newPath, currentPath, e) {
        document.body.style.overflow = "hidden"

        startAnimation(document)
        const text = await getNextPage(newPath)
        if (text != false) {
            const nextPageDocument = strToHtml(text)
            const done = replaceHead(document, nextPageDocument)
            if (done) {
                const res = checkExistingOfMainElements(nextPageDocument)
                if (res) {
                    setTimeout(() => {
                        replacePages(document, nextPageDocument, newPath, currentPath)
                        return endAnimation(document, nextPageDocument)

                    }, 500);


                } else {
                    window.location = newPath
                    return window.location.pathname = newPath
                }

            }
        } else {
            window.location = newPath
            return window.location.pathname = newPath
        }

    }


    async function getNextPage(url) {
        try {
            const res = await fetch(url, { method: 'get' })
            if (res.status == 200) {

                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("text/html") === -1) return false

                return await res.text()
            } else {
                return null
            }
        } catch (error) {
            throw error
        }
    }




    function strToHtml(text) {
        var doc = new DOMParser().parseFromString(text, "text/html");
        return doc
    }

    function checkExistingOfMainElements(nextPageHtml) {
        const currentPage = document.getElementById('main')
        const nextPage = nextPageHtml.querySelector('#main')
        if (!currentPage || !nextPage) return false
        return true
    }

    function replaceHead(currentPage, nextPage) {
        var oldStyles = currentPage.querySelectorAll("link[data-freet-reload='true']")
        for (let i = 0; i < oldStyles.length; i++) {
            oldStyles[i].remove()
        }
        var newStyles = nextPage.querySelectorAll("link[data-freet-reload='true']")
        for (let i = 0; i < newStyles.length; i++) {
            newStyles[i].remove()
            currentPage.querySelector('head').appendChild(newStyles[i])
        }
        let newTitle = nextPage.querySelector('title').innerText
        currentPage.querySelector('title').innerText = newTitle
        return true
    }


    function replacePages(currentPage, nextPage, newPath) {

        let newContent = nextPage.querySelector('#main')
        window.history.pushState("", "", newPath);
        currentPage.querySelector('#main').innerHTML = newContent.innerHTML
        const scripts = remove_js();
        return reload_js(nextPage, scripts)

    }

    function remove_js() {

        var scripts = document.querySelectorAll("script[data-freet-reload='true']")
        let urls = []
        for (let i = 0; i < scripts.length; i++) {
            scripts[i].remove()
            let src = scripts[i].getAttribute('src')
            urls.push(src)
        }
        return urls
    }

    function reload_js(nextPage, oldScripts) {
        var body = document.querySelector('body')
        const scripts = nextPage.querySelectorAll("script[data-freet-reload='true']")
        for (let i = 0; i < scripts.length; i++) {
            var newscript = document.createElement('script');
            newscript.src = scripts[i].getAttribute('src');
            newscript.setAttribute('data-freet-reload', 'true')
            body.appendChild(newscript);

        }

    }


    function startAnimation(current) {
        const main = current.querySelector('#main')
        if (main) {
            const animation = current.querySelector('#main').dataset.outanimation
            current.querySelector('#main').style.opacity = 0
            setTimeout(() => {
                scrollTopFunction()
            }, 500);

            if (animation === 'slide-left' || animation === 'slide-right') {
                current.querySelector('#main').style.transform = animation == 'slide-left' ? 'translateX(120%)' : 'translateX(-120%)'
            }
            if (animation === 'fade') {
                current.querySelector('#main').style.opacity = 0
            }
        }

    }

    function endAnimation(current, newpage) {
        const currentOutAnimation = current.querySelector('#main').dataset.outanimation

        const inanimation = newpage.querySelector('#main').dataset.inanimation
        const outanimation = newpage.querySelector('#main').dataset.outanimation

        // re-add new animation
        current.querySelector('#main').dataset.inanimation = inanimation
        current.querySelector('#main').dataset.outanimation = outanimation

        setTimeout(() => {

            if (currentOutAnimation === 'fade' && inanimation === 'fade') {
                current.querySelector('#main').style.opacity = 1;
            }

            if (currentOutAnimation === 'fade' && inanimation === 'slide-left' || inanimation === 'slide-right') {
                current.querySelector('#main').style.transform = inanimation == 'slide-left' ? 'translateX(-120%)' : 'translateX(120%)'
                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                    current.querySelector('#main').style.transform = 'unset'
                }, 500);
            }


            if (currentOutAnimation === 'slide-right' || currentOutAnimation === 'slide-left' && inanimation === 'fade') {
                current.querySelector('#main').style.transform = 'translateX(0%)'
                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                }, 800);
            }

            if (currentOutAnimation === 'slide-right' || currentOutAnimation === 'slide-left' && inanimation === 'slide-left' || inanimation === 'slide-right') {
                current.querySelector('#main').style.transform = inanimation == 'slide-left' ? 'translateX(120%)' : 'translateX(-120%)'

                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                    current.querySelector('#main').style.transform = 'unset'
                }, 800);
            }
            setTimeout(() => {
                document.body.style.overflow = "unset"
            }, 1000);
        }, 500);
        return true
    }


    function scrollTopFunction() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }



});

