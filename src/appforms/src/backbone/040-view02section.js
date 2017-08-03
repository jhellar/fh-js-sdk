var SectionView=Backbone.View.extend({

  addInputButtonClass: ".fh_appform_addSectionBtn",
  removeInputButtonClass: ".fh_appform_removeSectionBtn",

  viewMap: {
    "text": FieldTextView,
    "number": FieldNumberView,
    "textarea": FieldTextareaView,
    "radio": FieldRadioView,
    "checkboxes": FieldCheckboxView,
    "dropdown": FieldSelectView,
    "file": FieldFileView,
    "emailAddress": FieldEmailView,
    "phone": FieldPhoneView,
    "location": FieldGeoView,
    "photo": FieldCameraView,
    "signature": FieldSignatureView,
    "locationMap": FieldMapView,
    "dateTime":FieldDateTimeView,
    "sectionBreak":FieldSectionBreak,
    "url":FieldUrlView,
    "barcode": FieldBarcodeView,
    "sliderNumber": FieldSliderNumberView,
    "readOnly": FieldReadOnlyView
  },

  checkActionBar: function() {
    var curNum = this.secCurRepeat;
    var secMaxRepeat = this.secMaxRepeat;
    var minRepeat = this.secInitialRepeat;
    if (curNum < secMaxRepeat) {
      this.$sec_fh_appform_fieldActionBar.find(this.addInputButtonClass).show();
    } else {
      this.$sec_fh_appform_fieldActionBar.find(this.addInputButtonClass).hide();
    }

    if (curNum > minRepeat) {
      this.$sec_fh_appform_fieldActionBar.find(this.removeInputButtonClass).show();
    } else {
      this.$sec_fh_appform_fieldActionBar.find(this.removeInputButtonClass).hide();
    }
  },

  addSection: function() {
    var self = this;
    var index = this.secCurRepeat;

    this.renderSection(index);

    this.secCurRepeat++;
  },

  showSection: function() {
    var self = this;
    var secCurRepeat = this.secCurRepeat;
    var nextIndex = secCurRepeat;
    var sectionWrapper = $(self.sectionWrapper[0]);
    var nextSection = sectionWrapper.find('#fh_appform_' + self.options.sectionKey + '_' + nextIndex);
    nextSection.show();
    this.secCurRepeat++;

  },

  hideSection: function() {
    var self = this;
    var secCurRepeat = this.secCurRepeat;
    var lastIndex = secCurRepeat - 1;
    var sectionWrapper = $(self.sectionWrapper[0]);
    var lastSection = sectionWrapper.find('#fh_appform_' + self.options.sectionKey + '_' + lastIndex);
    lastSection.hide();
    this.secCurRepeat--;
  },

  removeSection: function() {
    var self = this;
    var secCurRepeat = this.secCurRepeat;
    var lastIndex = secCurRepeat - 1;
    var sectionWrapper = $(self.sectionWrapper[0]);
    var lastSection = sectionWrapper.find('#fh_appform_' + self.options.sectionKey + '_' + lastIndex);
    lastSection.remove();
    this.secCurRepeat--;
  },

  initialize: function(options) {
    this.options = options;

    this.render();
  },

  renderSection: function(index) {

    function toggleSection(fieldTarget){
      if(fieldTarget){
        $('#' + fieldTarget).slideToggle(600);
        $('#' + fieldTarget + "_icon").toggleClass('icon-chevron-sign-up');
        $('#' + fieldTarget + "_icon").toggleClass('icon-chevron-sign-down');
      }
    }

    var self = this;

    var title = self.options.title + (self.options.repeating ? (' - ' + (index + 1)) : '');

    //Add the section fields
    var sectionEl = $(_.template(self.options.formView.$el.find('#temp_section_structure').html())( {
      sectionId: self.options.sectionKey,
      title: title,
      description: self.options.description,
      index: self.options.sectionIndex,
      sectionIndex: index,
      repeating: self.options.repeating
    }));
    var sectionDivId = '#fh_appform_' + self.options.sectionKey + '_' + index +  '_body_icon';
    sectionEl.find('.panel-heading').off('click');
    sectionEl.find(sectionDivId).off('click');

    sectionEl.find(sectionDivId).on('click', function(e){
      var fieldTarget = $(this).parent().data().field;
      toggleSection(fieldTarget);
    });

    sectionEl.find('.panel-heading').on('click', function(e){
      if($(e.target).data()){
        if($(e.target).data().field){
          toggleSection($(e.target).data().field);
        }
      }
    });
    var sectionWrapper = $(self.sectionWrapper[0]).find('.sections');
    sectionWrapper.append(sectionEl);

    self.options.fields.forEach(function(field, fieldIndex){
      var fieldType = field.getType();
      if (self.viewMap[fieldType]) {

        $fh.forms.log.l("*- "+fieldType);

        if(fieldType !== "sectionBreak"){
            self.options.parentView.fieldViews[field.get('_id') + '_' + index] = new self.viewMap[fieldType]({
            parentEl: sectionEl.find('.panel-body'),
            parentView: self,
            model: field,
            formView: self.options.formView,
            sectionName: self.options.sectionKey,
            sectionIndex: index
          });
        }
      } else {
        $fh.forms.log.w('FIELD NOT SUPPORTED:' + fieldType);
      }
    });
  },

  render: function() {
    var self = this;

    this.secInitialRepeat = 1;
    this.secMaxRepeat = 1;
    this.secCurRepeat = 0;

    if (this.options.repeating) {
      this.secInitialRepeat = this.options.minRepeat;
      this.secMaxRepeat = this.options.maxRepeat;
    }

    this.sectionWrapper = $(_.template(self.options.formView.$el.find('#temp_page_structure').html())( {
      sectionId: self.options.sectionKey,
      repeating: self.options.repeating
    }));

    this.options.parentEl.append(this.sectionWrapper);


    for (var i = 0; i < this.secMaxRepeat; i++) {
      this.addSection();
    }
    for (i = this.secInitialRepeat; i < this.secMaxRepeat; i++) {
      this.hideSection();
    }

    this.$sec_fh_appform_fieldActionBar = $(this.sectionWrapper[0]).find('.fh_appform_section_button_bar');

    this.$sec_fh_appform_fieldActionBar.find('.fh_appform_addSectionBtn').unbind().bind('click', function() {
      self.showSection();
      self.checkActionBar();
    });

    this.$sec_fh_appform_fieldActionBar.find('.fh_appform_removeSectionBtn').unbind().bind('click', function() {
      self.hideSection();
      self.checkActionBar();
    });

    this.checkActionBar();
  }

});
