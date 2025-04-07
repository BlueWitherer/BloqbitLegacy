/**
 * @enum {number} Type of filtering.
 */
class MessageFilterMode {
    static INCLUDE = 1;
    static EXCLUDE = 0;

    static values() {
        return [
            this.INCLUDE,
            this.EXCLUDE,
        ];
    };
};

export default MessageFilterMode;