function deleteBook(id){
    console.log("delete!!!!");
    $.ajax({
        url: '/book/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};