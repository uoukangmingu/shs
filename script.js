const startScreen = document.getElementById('startScreen');
const modeScreen = document.getElementById('modeScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const playButton = document.getElementById('playButton');
const reactionMode = document.getElementById('reactionMode');
const agilityMode = document.getElementById('agilityMode');
const beepSound = document.getElementById('beepSound'); // 효과음 추가
const mainBGM = document.getElementById("mainBGM");
const reactionBGM = document.getElementById("reactionBGM");
const agilityBGM = document.getElementById("agilityBGM");
const clearBGM = document.getElementById("clearBGM");

let currentBGM = null;

function playBGM(bgm) {
    stopAllBGM();
    currentBGM = bgm;
    if (currentBGM) {
        currentBGM.currentTime = 0;
        currentBGM.volume = 0.5;
        currentBGM.play().catch(err => {
            console.warn("BGM 재생 실패:", err);
        });
    }
}


function stopAllBGM() {
    [mainBGM, reactionBGM, agilityBGM, clearBGM].forEach(bgm => {
        if (!bgm.paused) {
            bgm.pause();
            bgm.currentTime = 0;
        }
    });
}

let startTime, endTime;
let currentMode = ""; // 현재 플레이 중인 모드 ('reaction' 또는 'agility')

function showScreen(screen) {
    startScreen.classList.add('hidden');
    modeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');

    // 🎶 화면별로 BGM 변경
    if (screen === modeScreen) {
        playBGM(mainBGM);
    } else if (screen === gameScreen) {
        // 게임별 모드에 따라 다르게 처리되므로 생략
    } else {
        stopAllBGM(); // 결과, 리더보드 등에서는 정지
    }
}

playButton.addEventListener('click', () => showScreen(modeScreen));

reactionMode.addEventListener('click', () => {
    currentMode = "reaction";
    playBGM(reactionBGM); // 🎶 순발력 모드 BGM 재생
    startCountdown(startReactionMode);
});


agilityMode.addEventListener('click', () => {
    currentMode = "agility";
    playBGM(agilityBGM); // 🎶 민첩성 모드 BGM 재생
    startCountdown(startAgilityMode);
});


let timerInterval; // 타이머 인터벌 저장 변수
const timerDisplay = document.getElementById("timerDisplay"); // 타이머 UI

function startCountdown(startGameFunction) {
    showScreen(gameScreen);
    stopTimer();
    stopAllBGM(); // 🔇 모든 BGM 정지 (모드 선택 음악 포함)

    let countdown = 5;
    timerDisplay.classList.add("hidden");

    function playBeep() {
        if (beepSound) {
            beepSound.currentTime = 0;
            beepSound.play();
        }
    }

    gameScreen.innerHTML = `<p>게임 시작까지: ${countdown}</p>`;
    playBeep();

    let countdownInterval = setInterval(() => {
        countdown--;
        gameScreen.innerHTML = `<p>게임 시작까지: ${countdown}</p>`;
        if (countdown > 0) {
            playBeep();
        } else {
            clearInterval(countdownInterval);
            startTime = Date.now();
            timerDisplay.classList.remove("hidden");
            startTimer();

            // 🎵 게임 모드별 BGM 재생 (여기서 시작!)
            if (currentMode === "reaction") playBGM(reactionBGM);
            else if (currentMode === "agility") playBGM(agilityBGM);

            startGameFunction();
        }
    }, 1000);
}

/** 실시간 타이머 시작 */
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // 기존 타이머가 있으면 먼저 정지
    }
    timerInterval = setInterval(() => {
        let elapsedTime = ((Date.now() - startTime) / 1000).toFixed(3);
        timerDisplay.innerHTML = `경과 시간: ${elapsedTime}초`;
    }, 10);
}

/** 게임 종료 시 타이머 정지 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null; // 인터벌 변수 초기화
        timerDisplay.classList.add("hidden"); // 타이머 숨기기
    }
}

const keyPressSound = new Audio("keypress.mp3"); // 효과음 파일 추가

function startReactionMode() {
    isGamePlaying = true;
    stopTimer();
    showScreen(gameScreen);
    let successCount = 0;
    let expectedKeys = [];

    startTime = Date.now();
    timerDisplay.classList.remove("hidden");
    startTimer();

    generateLetters();

    function generateLetters() {
        let letter1, letter2;

        do {
            letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        } while (letter1 === letter2);

        expectedKeys = [letter1, letter2];

        gameScreen.innerHTML = `
            <p class="letter" id="letter-${letter1}">${letter1}</p>
            <p class="letter" id="letter-${letter2}">${letter2}</p>
        `;
    }

    function checkKey(event) {
        let pressedKey = event.key.toUpperCase();

        if (expectedKeys.includes(pressedKey)) {
            keyPressSound.currentTime = 0;
            keyPressSound.play();

            let letterElement = document.getElementById(`letter-${pressedKey}`);
            if (letterElement) {
                letterElement.classList.add("pressed");
                setTimeout(() => {
                    letterElement.classList.remove("pressed");
                    letterElement.classList.add("clicked");
                }, 100);
            }

            expectedKeys = expectedKeys.filter(k => k !== pressedKey);

            if (expectedKeys.length === 0) {
                successCount++;
                if (successCount < 5) {
                    generateLetters();
                } else {
                    endTime = Date.now();
                    document.removeEventListener('keydown', checkKey);
                    stopTimer();
                    showResult();
                }
            }
        } else if (/^[A-Z]$/.test(pressedKey)) {
            startTime -= 1000;
            showPenaltyEffect();
        }
    }

    document.removeEventListener('keydown', checkKey);
    document.addEventListener('keydown', checkKey);
}


/** 민첩성 게임 실행 */
function startAgilityMode() {
    isGamePlaying = true;
    stopTimer(); // 이전 타이머 강제 종료
    showScreen(gameScreen);
    let keyPressCount = 0;
    startTime = Date.now();
    timerDisplay.classList.remove("hidden"); // 타이머 보이기
    startTimer(); // 실시간 타이머 시작

    // 해킹 효과 컨테이너 추가 (한 번만 생성)
    gameScreen.innerHTML = `<p id="instructionText">키보드를 마구 눌러주세요! (0/486)</p>`;

    let hackingContainer = document.getElementById("hackingContainer");
    if (!hackingContainer) {
        hackingContainer = document.createElement("div");
        hackingContainer.id = "hackingContainer";
        document.body.appendChild(hackingContainer); // 게임 화면이 아닌 전체 화면에 추가
    }
    hackingContainer.innerHTML = ""; // 기존 내용 초기화

    function countKeyPress(event) {
        keyPressCount++;
        document.getElementById("instructionText").innerHTML = `키보드를 마구 눌러주세요! (${keyPressCount}/486)`;

        // 해킹 효과 추가
        let randomText = generateRandomText();
        let hackingEffect = document.createElement("p");
        hackingEffect.classList.add("hacking-effect");
        hackingEffect.textContent = randomText;
        hackingContainer.appendChild(hackingEffect);

        // 오래된 텍스트 제거 (최대 15줄 유지)
        if (hackingContainer.childNodes.length > 15) {
            hackingContainer.removeChild(hackingContainer.firstChild);
        }

        if (keyPressCount >= 486) {
            endTime = Date.now();
            document.removeEventListener('keydown', countKeyPress);
            stopTimer(); // 타이머 정지
            hackingContainer.remove(); // 해킹 효과 창 삭제
            showResult(); // 결과 표시
        }
    }

    document.removeEventListener('keydown', countKeyPress);
    document.addEventListener('keydown', countKeyPress);
}

/** 랜덤한 해킹 효과 텍스트 생성 */
function generateRandomText() {
    let length = Math.floor(Math.random() * 15) + 5; // 5~20 길이의 랜덤 문자열
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};':\",.<>?";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showResult() {
    isGamePlaying = false;
    stopTimer();              
    showScreen(resultScreen); // ✅ 먼저 화면을 띄운다
    stopAllBGM();             // 이전 음악 종료
    playBGM(clearBGM);        // ✅ 그 후 클리어 브금 재생

    let timeTaken = ((endTime - startTime) / 1000).toFixed(3);
    timerDisplay.innerHTML = `최종 시간: ${timeTaken}초`;

    resultScreen.innerHTML = `
        <h2>완료!</h2>
        <p>소요 시간: ${timeTaken}초</p>
        <div id="recordButtonsContainer">
            <button id="recordButton" onclick="showNameInput()">기록 입력</button>
            <button id="skipRecordButton" onclick="skipRecord()">기록 입력 생략</button>
        </div>
        <div id="nameInputSection" class="hidden">
            <p>[이름 / 전화번호 네자리]입력:</p>
            <input type="text" id="playerName" placeholder="홍길동 1234">
            <button id="saveButton" onclick="saveRecord()">기록 저장</button>
        </div>
    `;
}


/** 기록 입력 생략 */
function skipRecord() {
    showScreen(modeScreen); // 게임 모드 선택 화면으로 이동
}

/** 기록 입력 UI 표시 (기록 입력 버튼 클릭 시 실행) */
function showNameInput() {
    document.getElementById("recordButton").style.display = "none"; // 기록 입력 버튼 숨기기
    document.getElementById("skipRecordButton").style.display = "none"; // 기록 입력 생략 버튼 숨기기
    document.getElementById("nameInputSection").classList.remove("hidden"); // 입력 UI 표시

    // 입력란에 자동 포커스
    let nameInput = document.getElementById("playerName");
    setTimeout(() => nameInput.focus(), 100);

    // Enter 키로 기록 저장
    nameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveRecord();
        }
    });
}



function saveRecord() {
    let playerName = document.getElementById("playerName").value.trim() || "익명";
    let timeTaken = ((endTime - startTime) / 1000).toFixed(3);
    let storageKey = `leaderboard_${currentMode}`;

    let leaderboard = JSON.parse(localStorage.getItem(storageKey)) || [];

    const previousFirst = leaderboard.length > 0 ? leaderboard[0].time : Infinity;
    const isNewRecord = parseFloat(timeTaken) < previousFirst;

    leaderboard.push({ name: playerName, time: parseFloat(timeTaken) });
    leaderboard.sort((a, b) => a.time - b.time);
    localStorage.setItem(storageKey, JSON.stringify(leaderboard));

    updateTop3();

    // 🎉 새로운 1위라면 효과 발동!
    if (isNewRecord) {
        newRecordEffect();
    }

    showLeaderboard(currentMode);
}


/** 리더보드 화면 표시 */
function showLeaderboard(mode) {
    let storageKey = `leaderboard_${mode}`;
    let leaderboard = JSON.parse(localStorage.getItem(storageKey)) || [];

    // 리더보드 리스트 생성
    let leaderboardList = leaderboard
        .map((entry, index) => `<li>${index + 1}. ${entry.name} - ${entry.time}초</li>`)
        .join("");

    leaderboardScreen.innerHTML = `
        <h2>${mode === "reaction" ? "순발력 리더보드" : "민첩성 리더보드"}</h2>
        <ul>${leaderboardList}</ul>
        <button onclick="showScreen(modeScreen)">게임 모드 선택</button>
        <button onclick="showScreen(startScreen)">처음으로</button>
    `;
    showScreen(leaderboardScreen);
}

document.addEventListener("keydown", function (event) {
    // ✅ 1. Ctrl + B는 무조건 허용 & 기본 동작 차단
if (event.ctrlKey) {
    switch (event.key.toLowerCase()) {
        case 'b':
            event.preventDefault();
            clearRecords();
            return;
        // 추후: case 'r': resetGame(); break;
    }
}

    // ✅ 2. 게임 중이 아닐 땐 제한 없음
    if (!isGamePlaying) return;

    // ✅ 3. 알파벳만 허용
    const key = event.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) {
        event.preventDefault();
        event.stopPropagation();
        console.log(`⛔ 무시된 키: ${event.key}`);
    }
});


/** 기록 초기화 함수 */
function clearRecords() {
    if (confirm("정말로 모든 기록을 초기화하시겠습니까?")) {
        localStorage.removeItem("leaderboard_reaction"); // 순발력 기록 삭제
        localStorage.removeItem("leaderboard_agility"); // 민첩성 기록 삭제
        updateTop3(); // 탑 랭크 초기화
        alert("모든 기록이 초기화되었습니다.");
    }
}

/** 현재 Top 3 랭커 표시 (기록 초기화 후에도 업데이트됨) */
function updateTop3() {
    let reactionRecords = JSON.parse(localStorage.getItem("leaderboard_reaction")) || [];
    let agilityRecords = JSON.parse(localStorage.getItem("leaderboard_agility")) || [];

    let reactionTop3 = reactionRecords.length > 0 
        ? reactionRecords.slice(0, 3).map((entry, index) => 
            `<li>${index + 1}. ${entry.name} - ${entry.time}초</li>`).join("")
        : "<li>기록 없음</li>";

    let agilityTop3 = agilityRecords.length > 0 
        ? agilityRecords.slice(0, 3).map((entry, index) => 
            `<li>${index + 1}. ${entry.name} - ${entry.time}초</li>`).join("")
        : "<li>기록 없음</li>";

    document.getElementById("reactionTop3").innerHTML = reactionTop3;
    document.getElementById("agilityTop3").innerHTML = agilityTop3;
}

/** 페이지 로드 시 Top 3 정보 갱신 */
document.addEventListener("DOMContentLoaded", updateTop3);

document.getElementById("fullscreenButton").addEventListener("click", function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            document.body.classList.add("noscroll"); // 스크롤 차단
        });
    } else {
        document.exitFullscreen().then(() => {
            document.body.classList.remove("noscroll"); // 스크롤 복구
        });
    }
});

document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        document.body.classList.add("noscroll");
    } else {
        document.body.classList.remove("noscroll");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    let youtubeAd = document.getElementById("youtubeAd");
    let videoIds = ["wS_eIGIyVy4", "j-mRYns3bKs"];
    let currentIndex = 0;

    function switchVideo() {
        currentIndex = (currentIndex + 1) % videoIds.length;
        youtubeAd.src = `https://www.youtube.com/embed/${videoIds[currentIndex]}?autoplay=1&mute=1&loop=0&controls=0&showinfo=0&modestbranding=1`;
    }

    // 일정 간격으로 영상이 끝났는지 확인 (매 5초마다)
    setInterval(function () {
        let videoDuration = 90; // 각 영상 길이 (초) - 정확한 길이를 설정해야 함
        let elapsedTime = Math.floor((new Date().getTime() / 1000) % videoDuration);

        if (elapsedTime >= videoDuration - 2) { // 끝나기 직전 자동 변경
            switchVideo();
        }
    }, 5000); // 5초마다 체크
});

function newRecordEffect() {
    // 사운드 재생
    const celebrateSound = document.getElementById("celebrateSound");
    if (celebrateSound) {
        celebrateSound.currentTime = 0;
        celebrateSound.play();
    }

    // 폭죽 효과
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "firework";
        const size = Math.random() * 8 + 5 + "px";
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`;

        particle.style.width = size;
        particle.style.height = size;
        particle.style.backgroundColor = color;
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }

    // 🎉 "새로운 1위 등극!" 텍스트 표시
    const text = document.createElement("div");
    text.id = "newRecordText";
    text.innerText = "✨ 새로운 1위 등극! ✨";
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 2500);
}


// CSS 애니메이션을 위한 코드 (index.html에 넣어도 됨)
const style = document.createElement("style");
style.textContent = `
@keyframes fadePenalty {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}
@keyframes fadeOutPenalty {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}
.firework {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    animation: explode 1s ease-out forwards;
    z-index: 9999;
}

@keyframes explode {
    0% { opacity: 1; transform: scale(0); }
    100% { opacity: 0; transform: scale(1.5); }
}

#newRecordText {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    color: #ffcc00;
    background-color: rgba(0, 0, 0, 0.85);
    padding: 20px 40px;
    border: 3px solid #ffcc00;
    border-radius: 15px;
    font-family: 'Press Start 2P', cursive;
    z-index: 10000;
    animation: popFade 2s ease-out forwards;
}

@keyframes popFade {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    30% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}
`;
document.head.appendChild(style);

function showPenaltyEffect() {
    const penaltyText = document.createElement("div");
    penaltyText.innerText = "패널티 +1초";
    penaltyText.style.position = "fixed";
    penaltyText.style.top = "50%";
    penaltyText.style.left = "50%";
    penaltyText.style.transform = "translate(-50%, -50%)";
    penaltyText.style.fontSize = "2rem";
    penaltyText.style.color = "#ff5555";
    penaltyText.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    penaltyText.style.padding = "15px 30px";
    penaltyText.style.border = "3px solid #ff5555";
    penaltyText.style.borderRadius = "10px";
    penaltyText.style.zIndex = "9999";
    penaltyText.style.animation = "fadeOutPenalty 1s ease-out forwards";

    document.body.appendChild(penaltyText);

    setTimeout(() => {
        penaltyText.remove();
    }, 1000);
}
