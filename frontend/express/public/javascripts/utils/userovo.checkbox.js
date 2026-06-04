// userovo checkbox jQuery plugin
(function($){	
    $.fn.userovoCheckbox = function(options) {
  // support multiple elements
  if (this.length > 1){
      this.each(function() { $(this).userovoCheckbox(options) });
      return this;
  }
  
  // public methods        
  this.initialize = function() {
      // define reference dom element as variable
      var initializedBefore = typeof $(this).attr('class') !== 'undefined' ? $(this).attr('class').split(' ').indexOf('userovo-checkbox-wrapper') > -1 : false;
      if (initializedBefore) {
          return this;
      }

      var ref = this;
      var hasLabel = $(ref).attr('data-label') ? true : false;
      // add wrapper class
      ref.addClass('userovo-checkbox-wrapper');
      // set default state
      ref.attr('data-checked', false);
      
      // prepare required dom elements
      var checkIcon = '<i class="fas fa-check userovo-checkbox-icon"></i>';
      var nativeCheckbox = '<input type="checkbox" id="cc-' + $(ref).attr('id') + '" class="userovo-checkbox-native"/>';
      var label = '<span class="userovo-checkbox-label">' + $(ref).attr('data-label') + '</span>';
      // add required dom elements
      ref.append(checkIcon);
      ref.append(nativeCheckbox);
      if (hasLabel) ref.after(label);
      
      // add event handlers
      $('body').off('click', '.userovo-checkbox-wrapper').on('click', '.userovo-checkbox-wrapper', function() {
          // is checkbox checked?
          var checkedState = $(this).find('.userovo-checkbox-native')[0].checked;
          // make ui changes
          if (checkedState) {
              $(this).addClass('userovo-checkbox-checked');
              $(this).find('.userovo-checkbox-icon').css('opacity', 1);
          }
          else {
              $(this).removeClass('userovo-checkbox-checked');
              $(this).find('.userovo-checkbox-icon').css('opacity', 0);
          }
          // update ref data attribute
          $(this).attr('data-checked', checkedState);
      });
      return this;
  };

  this.set = function(val) {
      // make ui changes
      if (val) {
          $(this).addClass('userovo-checkbox-checked');
          $(this).find('.userovo-checkbox-icon').css('opacity', 1);
      }
      else {
          $(this).removeClass('userovo-checkbox-checked');
          $(this).find('.userovo-checkbox-icon').css('opacity', 0);
      }
      // update ref data attribute
      $(this).attr('data-checked', val);
      $(this).find('.userovo-checkbox-native')[0].checked = val;
      return this;
  };

  this.get = function() {
      return $(this).find('.userovo-checkbox-native')[0].checked;
  };

  this.setDisabled = function() {
      $(this).addClass('userovo-checkbox-disabled');
      $(this).find('.userovo-checkbox-native').attr('disabled','disabled');
  }

  this.unsetDisabled = function() {
      $(this).removeClass('userovo-checkbox-disabled');
      $(this).find('.userovo-checkbox-native').removeAttr('disabled');
  }

  return this.initialize();
    };
})(jQuery);