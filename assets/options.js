$(function(){
  $(document).ready(function() {
     init();
     setEvents();
  });

  function init(){
    var initialSelected = $( "#suppression-group option:selected" ).val();
    changeOptions(initialSelected);
  }

  function changeOptions(suppressed){
    $("ul").css("display", "none");
    $("ul#"+suppressed).css("display", "block")
    $('form').find(':checked').each(function() {
       $(this).removeAttr('checked');
    });
  }

  function setEvents(){
    $("#suppression-group").on("change", function(){
      changeOptions($( "#suppression-group option:selected" ).val());
    })
  }

  
});