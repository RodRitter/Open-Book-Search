window.readyToLoad = true;
window.lastPageLoaded = 0;
window.maxPage = 99;
window.bookElements = {};
window.isFiltered = false;

$(document).ready(() => {
    getBooks(1, 'tolkien');

    $(window).scroll(function() {
        if(window.readyToLoad && $(window).scrollTop() + $(window).height() == $(document).height()) {
            if(window.lastPageLoaded+1 <= window.maxPage) {
                getBooks(window.lastPageLoaded+1, 'tolkien');
            }
        }
    });

    $('.search-input').on('input', function() {
        var query = $('.search-input').val();
        filterBooks(query.toLowerCase())
    });
});

function getBooks(page, author) {
    onSearch();

    $.get( "http://openlibrary.org/search.json",
    {
        format: 'json',
        author: author,
        page: page
    },
    function( bookData ) {
        let json = JSON.parse(bookData);
        window.lastPageLoaded = page;
        window.maxPage = Math.ceil(json.numFound/100);

        for(var i=0; i < json.docs.length; i++) {
            var book = json.docs[i];
            if(book.cover_edition_key) {
                var bookObj = {
                    id: book.cover_edition_key,
                    title: book.title,
                    languages: book.language,
                    published: book.publish_year ? book.publish_year.sort() : [],
                    cover: "http://covers.openlibrary.org/b/olid/"+book.cover_edition_key+"-L.jpg"
                }
                addBookElement(bookObj);
            }
        }

        var filterQuery = $('.search-input').val();
        if(filterQuery !== '') {
            filterBooks(filterQuery);
        }

        onSearchComplete(json);
    });
}

function onSearch() {
    window.readyToLoad = false;
    $('.loader').removeClass('hidden');
}

function onSearchComplete(data) {
    window.readyToLoad = true;
    $('.loader').addClass('hidden');
}

function addBookElement(book) {
    var bookEl = $('<div class="book"></div>')
    var cover = $('<div class="cover-wrapper"> <img class="book-cover" src="'+ book.cover +'"> </div>');
    var title = $('<h5 class="book-title">'+ book.title +'</h5>');
    var published = $('<p>First Published: <strong>'+ (book.published[0] ? book.published[0] : 'N/A') +'</strong></p>');
    var languages = '';

    if(book.languages !== undefined) {
        book.languages.forEach((lang) => {
            languages += '<span class="badge badge-pill badge-secondary">'+ lang +'</span> ';
        });
    }

    bookEl.append(cover, title, published, languages);

    window.bookElements[book.id] = bookEl;
    window.bookElements[book.id].title = book.title.toLowerCase();
    $('.book-list').append(bookEl);
}

function filterBooks(query) {
    window.resetFilter();
    window.isFiltered = true;
    
    var filtered = Object.keys(window.bookElements).filter(el => window.bookElements[el].title.indexOf(query) < 0);

    filtered.forEach((title) => {
        window.bookElements[title].addClass('hidden');
    })
}

function resetFilter() {
    window.isFiltered = false;
    Object.keys(window.bookElements).forEach((bookID) => {
        window.bookElements[bookID].removeClass('hidden');
    })
}
