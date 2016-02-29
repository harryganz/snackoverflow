$(function(){
  $('.add-ingredient').click(addIngredient);
});

function addIngredient(event){
  event.preventDefault();
  // Create a new ingredient div
  var $newIngredient = $('<div class="ingredient">');
  // Add text input
  $newIngredient.append('<input type="text" name="ingredient" class="form-control">');
  // Add add and delete buttons
  $newAddButton = $('<button class="add-ingredient">Add Ingredient</button>').
    click(addIngredient);
  $newDeleteButton = $('<button class="remove-ingredient">Remove Ingredient</button>').
    click(removeIngredient);
  $newIngredient.append($newAddButton).append($newDeleteButton);
  // Put after current parent
  var $parent = $(this).parent().after($newIngredient);
}

function removeIngredient(event){
  event.preventDefault();
  $(this).parent().remove();
}
