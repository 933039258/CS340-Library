function deleteBook(id){
    $.ajax({
        url: '/book/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};