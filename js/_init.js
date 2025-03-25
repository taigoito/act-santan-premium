/**
 * Init
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */

import DrawerMenu from './_drawerMenu.js';
import EvilIcons from './_evilIcons.js';
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.0/vue.esm-browser.js';

export default function init(catArr) {
  // DrawerMenu
  const siteBrand = document.querySelector('.footer__siteBrand');
  const primaryMenu = document.querySelector('.gNav__menu');
  new DrawerMenu({
    darkMode: true,
    siteBrand: siteBrand,
    primaryMenu: primaryMenu
  });

  // Evil Icons
  new EvilIcons();

  // Product
  const data = {
    data() {
      return {
        products: []
      }
    },

    async mounted() {
      // 定数
      const url = 'https://act-santan.jp/wp-json/wp/v2/product?per_page=100&order=asc';

      // データ取得
      const res = await fetch(`${url}`);
      const data = await res.json();

      // データ成形
      data.forEach((dt, i) => {
        // グループ配列を取得し、順次処理
        dt.attributes['groups'].forEach((group) => {

          // 引数の配列内の要素がグループ内にあれば、処理を続行
          if (catArr.includes(group.slug)) {
            const product = {};

            // 各属性値取得
            product.name = dt.attributes['product_name'];
            product.image = dt.attributes['product_image'];
            product.price = dt.attributes['product_price'];
            product.id = dt.attributes['cart_id'];
    
            // 書式変換
            product.price = `${(product.price - 0).toLocaleString()}円(税込)`;
    
            // 数量初期値
            product.value = 1;

            // dataに格納
            this.products.push(product);
          }
        });
      });

      this.$nextTick(() => {
        // deli-cart
        var ua = window.navigator.userAgent;
        if (checkUserAgent(ua)) {
          $('#open').show();

          var cuser = 'C0001304'; //店舗ID
          var cart = $('#open').externalObentoCart({host:'https://www.deli-cart.jp' ,color: '#EA7100', cuser: cuser,buttonhtml: '<div><span style="background-color: #EA7100;background-image: url(\'//act-santan.jp/contents/img/08_btn-cart-cash.png\');"></span></div>'});
          // ↑background-image　のスタイル部分はレジに入れるボタンをサイトデザインに合わせたものに変更可能

          $('#open').on('click', function() {
            cart.toggle();
          });
          $('.add').click(function (event) {
            var click_index = $('.add').index(this);
            var item_id = $('.item_detail_info #item_detail_item_id').eq(click_index).val();
            var item_num = $('.item_detail_info .item_detail_number input').eq(click_index).val();
            var parent = $(this).parents('.item_detail_info');

            var variation_select = parent.find('.variations').children('.variation');
            var variation = '';
            variation_select.each(function(i, element) {
              if (i != 0) {
                variation += '/';
              }
              variation += $(element).val();
            });

            cart.addItem(item_id, variation, item_num).show();
          });
        } else {
          $('.add').click(function (event) {
            var click_index = $('.add').index(this);
            var item_id = $('.item_detail_info #item_detail_item_id').eq(click_index).val();
            var item_num = $('.item_detail_info .item_detail_number input').eq(click_index).val();
            var url = '//www.deli-cart.jp/api/cart/add?item=' + item_id + '&num=' + item_num;
            var parent = $(this).parents('.item_detail_info');

            var variation_select = parent.find('.variations').children('.variation');
            var variation = '';
            variation_select.each(function(i, element) {
              if (i != 0) {
                variation += '/';
              }
              variation += $(element).val();
            });

            if (variation) {
              url += '&variation=' + variation;
            }
            location.href = url;
          });
        }

        // Customize - 数量減
        var self = this;
        $('.item-num-decrease').click(function (event) {
          var click_index = $('.item-num-decrease').index(this);
          var $item_num = $('.item_detail_info .item_detail_number input').eq(click_index);
          var product_index = $item_num.attr('data-index');
          if (self.products[product_index].value > 1) self.products[product_index].value--;
        });

        // Customize - 数量増
        $('.item-num-increase').click(function (event) {
          var click_index = $('.item-num-increase').index(this);
          var $item_num = $('.item_detail_info .item_detail_number input').eq(click_index);
          var product_index = $item_num.attr('data-index');
          self.products[product_index].value++;
        });

      });
    }
  };

  createApp(data).mount('#product');
}
