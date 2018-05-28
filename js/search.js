window.readyToLoad = true;
window.lastPageLoaded = 0;
window.maxPage = 99;
window.bookElements = {};

$(document).ready(() => {
    getBooks(1, 'tolkien');

    $(window).scroll(function() {
        if(window.readyToLoad && $(window).scrollTop() + $(window).height() == $(document).height()) {
            if(window.lastPageLoaded+1 <= window.maxPage) {
                getBooks(window.lastPageLoaded+1, 'tolkien');
            }
        }
    });

    $('#filter-btn').click(function() {
        var fromDate = $('.search-input-year-start').val();
        var toDate = $('.search-input-year-end').val();
        filterBooks(fromDate, toDate);
    });
});

function getBooks(page, author) {
    onSearch();

    $.get( "https://openlibrary.org/search.json",
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
                    cover: "https://covers.openlibrary.org/b/olid/"+book.cover_edition_key+"-L.jpg"
                }
                addBookElement(bookObj);
            }
        }

        var fromDate = $('.search-input-year-start').val();
        var toDate = $('.search-input-year-end').val();
        filterBooks(fromDate, toDate);

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
    window.bookElements[book.id].year = book.published[0] ? book.published[0] : 0;
    $('.book-list').append(bookEl);
}

function filterBooks(dateFrom, dateTo) {
    resetFilter();

    var filtered = Object.keys(window.bookElements).filter(id => {
        return window.bookElements[id].year < Number(dateFrom) || window.bookElements[id].year > Number(dateTo)
    });

    filtered.forEach((id) => {
        window.bookElements[id].addClass('hidden');
    })
}

function resetFilter() {
    Object.keys(window.bookElements).forEach((bookID) => {
        window.bookElements[bookID].removeClass('hidden');
    })
}
