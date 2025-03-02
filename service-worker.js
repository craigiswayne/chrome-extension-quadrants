function inject_quadrant_html(){
    const class_name = 'chrome-extension-quadrants';
    if(document.querySelector(`.${class_name}`) !== null){
        return;
    }
    const container = document.createElement('div');
    container.classList.add(class_name);

    const number_of_lines = 16;

    for(let i=0; i<number_of_lines; i++){
        const percent_number = 100/number_of_lines*i;
        const percent = `${percent_number}%`;

        const horizontal_line = container.appendChild(document.createElement('div'));
        horizontal_line.style.setProperty('--percent', percent);
        horizontal_line.setAttribute('title',percent);
        horizontal_line.className = 'horizontal line';

        const vertical_line = container.appendChild(document.createElement('div'));
        vertical_line.style.setProperty('--percent', percent);
        vertical_line.setAttribute('title',percent);
        vertical_line.className = 'vertical line';
    }
    document.body.appendChild(container);
}

const ignored_urls = [
    'https://developer.chrome.com/docs/extensions',
    'https://developer.chrome.com/docs/webstore',
    'chrome://'
]

chrome.action.onClicked.addListener(async (tab) => {

    const current_url_is_ignored = ignored_urls
        .filter(ignored_url => tab.url.includes(ignored_url)).length !== 0;

    if(current_url_is_ignored){
        return;
    }

    const current_state = await chrome.action.getBadgeText({ tabId: tab.id });
    const new_state = current_state === 'ON' ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: new_state
    });

    const css_injection = {
        target: {tabId: tab.id},
        files: ['chrome-extension-quadrants.css']
    }

    if(current_state === 'ON'){
        chrome.scripting.removeCSS(css_injection);
    } else {
        chrome.scripting.insertCSS(css_injection, () => {
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                function: inject_quadrant_html
            });
        });
    }
});
