function deleteUser(id){
    console.log("delete!!!!");
    $.ajax({
        url: '/users/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};