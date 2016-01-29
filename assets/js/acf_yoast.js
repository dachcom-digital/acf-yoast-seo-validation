/**
 *
 * Add live SEO Validation to Yoast SEO while having custom ACF Fields.
 * Works also with Flexible Content and Repeater Fields.
 * https://github.com/dachcom-digital/acf-yoast-seo-validation.git
 *
 * Include this Javascript ONLY in BackEnd.
 *
 * @author: DACHCOM.DIGITAL | Stefan Hagspiel <shagspiel@dachcom.ch>
 * @version: 1.1.0
 *
 * All rights reserved.
 *
 */
(function( $ ) {

    var acfPlugin;

    //http://stackoverflow.com/a/965962
    jQuery.expr[':'].parents = function(a,i,m){
        return jQuery(a).parents(m[3]).length < 1;
    };

    var AcfPlugin = function() {

        this.content = {};
        this.pluginName = 'acfPlugin';

    };

    /**
     * Set's the field content to use in the analysis
     *
     * @param {Object} $el
     */
    AcfPlugin.prototype.setContent = function( $el ) {

        if( $el.prop('nodeName') == 'INPUT' || $el.prop('nodeName') == 'TEXTAREA' ) {
            $el = $el.closest('div[data-name]')
        }

        var $fieldKey = $el.find('label').first().attr('for'),
            type = $el.data('type'),
            value = null;

        switch( type) {

            case 'text' :
                value = $el.find('input').val();
                break;
            case 'image' :
                value = $el.find("img[src!='']").prop('outerHTML');
                break;
            case 'gallery' :
                value = '';
                $el.find("div.thumbnail > img").each(function(){
                    value += $(this).prop('outerHTML');
                });
                break;
            case 'wysiwyg' :
                value = $el.find('textarea').val();
                break;
            default :
                value = null;

        }

        //console.log(type, $fieldKey, value);

        if( value !== null ) {

            this.content[ $fieldKey ] = value;
            YoastSEO.app.pluginReloaded( this.pluginName );

        }

        return true;

    };

    /**
     * Removes the field content
     * Because ACF uses animation before element removal, we add an timeout.
     *
     * @param {Object} $el
     */
    AcfPlugin.prototype.removeContent = function( $el ) {

        var _this = this;

        console.log('removeContent', this.content);

        setTimeout(function() {

            $.each( _this.content, function(k,v) {

                if( $('label[for="'+k+'"]').filter(':parents(.clones)').length == 0 ) {

                    //console.log('delete label[for="'+k+'"]');
                    delete _this.content[ k ];

                }

            });

            YoastSEO.app.pluginReloaded( _this.pluginName );

        }, 600);

    };

    /**
     * Registers plugin to YoastSEO
     */
    AcfPlugin.prototype.registerPlugin = function() {
        YoastSEO.app.registerPlugin( this.pluginName, { status: 'ready' } );
    };

    /**
     * Registers modifications to YoastSEO
     */
    AcfPlugin.prototype.registerModifications = function() {
        YoastSEO.app.registerModification( 'content', this.addAcfDataToContent.bind( this ), this.pluginName, 10 );
    };

    /**
     * Adds ACF Data to content
     *
     * @param {String} content
     * @returns {String}
     */
    AcfPlugin.prototype.addAcfDataToContent = function( content ) {

        if( this.content.length == 0)
            return content;

        $.each( this.content, function(k,v) {
            content += v;
        });

        return content;

    };

    $(window).on('YoastSEO:ready', function () {

        acfPlugin = new AcfPlugin();
        acfPlugin.registerPlugin();
        acfPlugin.registerModifications();

        acf.add_action('load_field',    acfPlugin.setContent.bind(acfPlugin));
        acf.add_action('change',        acfPlugin.setContent.bind(acfPlugin));
        acf.add_action('remove',        acfPlugin.removeContent.bind(acfPlugin));

    });

}( jQuery ));