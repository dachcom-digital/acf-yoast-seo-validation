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
(function ($) {

    var acfPlugin;

    var AcfPlugin = function () {
        this.content = {};
        this.pluginName = 'acfPlugin';
    };

    AcfPlugin.prototype.initContent = function ($el) {
        this.setContent($el, true, false);
    };

    /**
     * Set's the field content to use in the analysis
     *
     * @param {Object} $el The current element that was added or modified, as a
     * jQuery object
     * @param {boolean} updateYoast If Yoast should be updated, default true
     * @param {boolean} updateRepeater If repeaters should be updated, default true
     */
    AcfPlugin.prototype.setContent = function ($el, updateYoast, updateRepeater) {
        updateYoast = typeof updateYoast !== 'undefined' ? updateYoast : true;
        updateRepeater = typeof updateRepeater !== 'undefined' ? updateRepeater : true;

        $el = $el.closest('[data-name][data-type][data-key]');

        var key = $el.data('key'),
            type = $el.data('type'),
            value = null,
            childID = null,
            parentKey = null;

        var $parent = $el.parent('.acf-row');
        if ($parent.length === 1) {
            childID = $parent.data('id');
            parentKey = $parent.closest('[data-name][data-type][data-key]').data('key');
        }

        switch (type) {
            case 'text' :
                value = $el.find('input').val();
                if ($el.is("[class*='wrap-in-']")) {
                    var wrapMatch = $el.attr('class').match(/wrap-in-(\w+)/);
                    value = '<' + wrapMatch[1] + '>' + value + "</" + wrapMatch[1] + ">";
                }
                break;
            case 'image' :
                value = $el.find("img[src!='']").prop('outerHTML');
                break;
            case 'gallery' :
                value = '';
                $el.find("div.thumbnail > img").each(function () {
                    value += $(this).prop('outerHTML');
                });
                break;
            case 'textarea' :
            case 'wysiwyg' :
                value = $el.find('textarea').val();
                break;
            case 'repeater' :
                if (updateRepeater) {
                    this.updateRepeater($el);
                }
            default :
                value = null;
        }

        if (value !== null) {
            if (childID === null) {
                this.content[key] = value;
            } else {
                if (this.content[parentKey] === undefined) {
                    this.content[parentKey] = {};
                }
                if (this.content[parentKey][childID] === undefined) {
                    this.content[parentKey][childID] = {};
                }
                this.content[parentKey][childID][key] = value;
            }
            if (updateYoast) {
                YoastSEO.app.pluginReloaded(this.pluginName);
            }
        }
        return true;
    };

    /**
     * Update the fields of a repeater. This function removes and re-adds the
     * fields in a repeater.
     * @param {Object} $el The repeater element as jQuery object
     */
    AcfPlugin.prototype.updateRepeater = function($el) {
        var _this = this;
        // delete repeater field
        delete _this.content[$el.data('key')];
        // re-add the repeater subfields
        $el.find('.acf-row:not(.acf-clone) .acf-field').each(function(índex, element) {
            _this.setContent($(element), false, false);
        });
        YoastSEO.app.pluginReloaded(this.pluginName);
    };

    /**
     * Registers plugin to YoastSEO
     */
    AcfPlugin.prototype.registerPlugin = function () {
        YoastSEO.app.registerPlugin(this.pluginName, {status: 'ready'});
    };

    /**
     * Registers modifications to YoastSEO
     */
    AcfPlugin.prototype.registerModifications = function () {
        YoastSEO.app.registerModification('content', this.addAcfDataToContent.bind(this), this.pluginName, 10);
    };

    /**
     * Adds ACF Data to content
     *
     * @param {String} yoastContent The page content, to be passed to Yoast
     * @returns {String} The page content with added extra field contents
     */
    AcfPlugin.prototype.addAcfDataToContent = function (yoastContent) {
        if (this.content.length === 0) {
            return yoastContent;
        }
        yoastContent += '\n';
        $.each(this.content, function (k, v) {
            if (typeof v === 'object') { // repeater
                $.each(v, function(repeaterKey, repeaterValue) {
                    $.each(repeaterValue, function(subkey, subvalue) {
                        yoastContent += subvalue + '\n';
                    });
                });
            } else {
                yoastContent += v + '\n';
            }
        });
        return yoastContent;
    };

    $(window).on('YoastSEO:ready', function () {
        acfPlugin = new AcfPlugin();
        acfPlugin.registerPlugin();
        acfPlugin.registerModifications();

        acf.add_action('load_field', acfPlugin.initContent.bind(acfPlugin));
        acf.add_action('change', acfPlugin.setContent.bind(acfPlugin));
    });

}(jQuery));