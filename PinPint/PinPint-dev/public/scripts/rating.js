
$(function () {
    // Get the updateRating.
    const updateRatingForm = $('#ratingForm');
    updateRatingForm.submit(function (event) {
        // Stop the browser from submitting the registerForm.
        event.preventDefault();
        const formData = updateRatingForm.serialize();
        $.ajax({
            type: 'POST',
            url: updateRatingForm.attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#ratingForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + "You haven't modified your rating"
                    + "</div>");
            } else {
                $("#ratingForm-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + "Your rating as been updated successfully"
                    + "</div>");
                if (location.pathname === "/bar") {
                    window.location.reload();
                } else {
                    navigatedLocation();
                }
            }
        }).fail(function () {
          //TODO add error message for rating is null
          if (rating === "") {
            $("#ratingForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "Please enter a rating"
                + "</div>");
          } else {
            $("#ratingForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "An unexpected error has occurred, please contact the Administrator"
                + "</div>");
              }
        })
    });

    $('#modalRating').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const barName = button.data('bar_name');
        const barID = button.data('bar_id');
        const rating = button.data('bar_rating');
        const comment = button.data('bar_comment');

        const modal = $(this);
        modal.find('.modal-title').text('Rate the bar : ' + barName);
        modal.find('#rating-field').val(rating);
        //TODO find a better way to send barID
        modal.find('#modalBarId').val(barID);
        modal.find('#modalBarName').val(barName);
        modal.find('#rating-comment').val(comment);
        modal.find('#ratingForm-message').html("");
    });
});
