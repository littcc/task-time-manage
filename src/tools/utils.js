// 辅助工具

const Utils = {
    hours: 3600,
    minutes: 60,
    /**
     * 根据参数获取一个开始及结束的时间戳
     * @param  {[type]} type [一个对象]
     * @return {start:xxx,end:xxx}      [开始及结束的时间戳]
     */
    getTimeStamp: (type) => {
        let time, day = 24 * 3600 * 1000;

        if (type.week) {

            let today = new Date(),
                lastWeek = (today.getDay() - 1 + 7) * day,
                start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - lastWeek;

            time = {
                start: start,
                end: start + (day * 7),
            };

        } else {
            // 逻辑未确定
            type.year = type.year || (new Date().getFullYear());
            type.month = type.month || (new Date().getMonth() + 1);

            time = {
                start: new Date(type.year, type.month, 1).getTime(),
                end: new Date(type.year, type.month, 0).getTime(),
            };
        }

        return time;

    },
    /**
     * @param  {[sting]} time 传入一个规定的时间标示 1h20m || 1h || 2m || 1
     * @return {boolean} 返回一个布尔
     */
    isTime: (time) => {
        return /(^\d+.{0,1}\d{0,2}[hm]?){1}(\d+[m]{1})?$/i.test(time.trim());
    },
    /**
     * [description] 时间转换
     */
    timeFormatTranslate: {
        /**
         * [description] 秒转时间 最小单位是小时
         * @param  {[number]} seconds [传入一个时间为秒的单位数字]
         * @return {[string]}     [返回小时为单位的字符串]
         */
        sToh: (seconds) => {
            return Utils.decimalAdjust('round', seconds / Utils.hours, -2) + 'H';

        },
        /**
         * [description] 秒转时间 最小单位是分钟
         * @param  {[number]} seconds [传入一个时间为秒的单位数字]
         * @return {[string]}     [返回分钟为单位的字符串]
         */
        sTom: (seconds) => {
            let h = parseInt(Utils.decimalAdjust('round', parseInt(seconds) / Utils.hours, -2));
            let m = Utils.decimalAdjust('round', (parseInt(seconds) % Utils.hours) / Utils.minutes, -2);
            let str = (h >= 1 ? h + 'H' : '') + (m > 0 ? m + 'M' : '');;

            return str === '' ? '-' : str;

        },
        /**
         * [description] 时转秒 
         * @param  {[number]} hours [传入一个单位(h或m)的字符串]
         * @return {[number]}     [返回一个计算好的秒数]
         */
        hTos: (str) => {
            let h, m, seconds,
                hours = str.toLocaleLowerCase();

            if (hours.indexOf('h') !== -1) {
                let time = hours.split('h');
                if (time[1] === '') {
                    seconds = time[0] * Utils.hours;
                } else {
                    seconds = (time[0] * Utils.hours) + (parseInt(time[1]) * Utils.minutes);
                }
                return parseInt(seconds);
            }

            if (hours.indexOf('m') !== -1) {
                // seconds = hours.split('m')[0] * Utils.minutes;
                seconds = parseInt(hours) * Utils.minutes;
            } else {
                seconds = hours * Utils.hours;
            }

            return parseInt(seconds);

        },
    },
    /**
     * [description] 阻止默认事件和冒泡
     * @param  {event} e 传入一个event
     */
    preventDefault: (e) => {
        e.stopPropagation();
        // e.preventDefault();
    },

    /**
     * [description] Math方法 返回一个十进制的带保留小数
     * @param  {string} type 选择一种数学方法包括 round&ceil&floor
     * @param  {number} value 数字
     * @param  {number} exp 保留小数几位 可以为负数,负数则为小数位数
     */
    decimalAdjust: function(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
}

export default Utils;