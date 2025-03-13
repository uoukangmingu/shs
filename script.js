const startScreen = document.getElementById('startScreen');
const modeScreen = document.getElementById('modeScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const playButton = document.getElementById('playButton');
const reactionMode = document.getElementById('reactionMode');
const agilityMode = document.getElementById('agilityMode');
const beepSound = document.getElementById('beepSound'); // 효과음 추가

let startTime, endTime;
let currentMode = ""; // 현재 플레이 중인 모드 ('reaction' 또는 'agility')

function showScreen(screen) {
    startScreen.classList.add('hidden');
    modeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

playButton.addEventListener('click', () => showScreen(modeScreen));

reactionMode.addEventListener('click', () => {
    currentMode = "reaction";
    startCountdown(startReactionMode);
});

agilityMode.addEventListener('click', () => {
    currentMode = "agility";
    startCountdown(startAgilityMode);
});

let timerInterval; // 타이머 인터벌 저장 변수
const timerDisplay = document.getElementById("timerDisplay"); // 타이머 UI

/** 5초 카운트다운 후 게임 시작 + 타이머 초기화 */
function startCountdown(startGameFunction) {
    showScreen(gameScreen);
    stopTimer(); // 이전 게임의 타이머를 무조건 정지
    let countdown = 5;
    timerDisplay.classList.add("hidden"); // 타이머 숨기기

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
            startTime = Date.now(); // 타이머 시작
            timerDisplay.classList.remove("hidden"); // 타이머 보이기
            startTimer(); // 실시간 타이머 시작
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

/** 순발력 게임 실행 */
function startReactionMode() {
    stopTimer(); // 이전 타이머 강제 종료
    showScreen(gameScreen);
    let successCount = 0;
    startTime = Date.now();
    timerDisplay.classList.remove("hidden"); // 타이머 보이기
    startTimer(); // 실시간 타이머 시작

    generateLetters();

    function generateLetters() {
        let expectedKeys = [];
        let letter1, letter2;

        do {
            letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        } while (letter1 === letter2);

        expectedKeys.push(letter1, letter2);
        gameScreen.innerHTML = `
            <p class="letter" id="letter-${letter1}">${letter1}</p>
            <p class="letter" id="letter-${letter2}">${letter2}</p>
        `;

        function checkKey(event) {
            let pressedKey = event.key.toUpperCase();
            if (expectedKeys.includes(pressedKey)) {
                // 키 입력 효과음 재생
                keyPressSound.currentTime = 0;
                keyPressSound.play();

                // 시각적 효과 추가 (눌린 효과)
                let letterElement = document.getElementById(`letter-${pressedKey}`);
                if (letterElement) {
                    letterElement.classList.add("pressed");
                    setTimeout(() => {
                        letterElement.classList.remove("pressed");
                        letterElement.classList.add("clicked"); // 어둡게 변경
                    }, 100);
                }

                // 입력된 키 제거
                expectedKeys = expectedKeys.filter(key => key !== pressedKey);
                if (expectedKeys.length === 0) { // 두 개의 키를 모두 입력했을 때
                    successCount++;
                    if (successCount < 5) {
                        generateLetters();
                    } else {
                        endTime = Date.now();
                        document.removeEventListener('keydown', checkKey);
                        stopTimer(); // 타이머 정지
                        showResult(); // 결과 표시
                    }
                }
            }
        }

        document.removeEventListener('keydown', checkKey);
        document.addEventListener('keydown', checkKey);
    }
}



/** 민첩성 게임 실행 */
function startAgilityMode() {
    stopTimer(); // 이전 타이머 강제 종료
    showScreen(gameScreen);
    let keyPressCount = 0;
    startTime = Date.now();
    timerDisplay.classList.remove("hidden"); // 타이머 보이기
    startTimer(); // 실시간 타이머 시작

    // 해킹 효과 컨테이너 추가 (한 번만 생성)
    gameScreen.innerHTML = `<p id="instructionText">키보드를 마구 눌러주세요! (0/312)</p>`;

    let hackingContainer = document.getElementById("hackingContainer");
    if (!hackingContainer) {
        hackingContainer = document.createElement("div");
        hackingContainer.id = "hackingContainer";
        document.body.appendChild(hackingContainer); // 게임 화면이 아닌 전체 화면에 추가
    }
    hackingContainer.innerHTML = ""; // 기존 내용 초기화

    function countKeyPress(event) {
        keyPressCount++;
        document.getElementById("instructionText").innerHTML = `키보드를 마구 눌러주세요! (${keyPressCount}/312)`;

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

        if (keyPressCount >= 312) {
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

/** 게임 종료 후 결과 표시 */
function showResult() {
    stopTimer(); // 타이머 정지
    let timeTaken = ((endTime - startTime) / 1000).toFixed(3);
    timerDisplay.innerHTML = `최종 시간: ${timeTaken}초`; // 최종 기록 업데이트

    resultScreen.innerHTML = `
        <h2>완료!</h2>
        <p>소요 시간: ${timeTaken}초</p>
        <div id="recordButtonsContainer">
            <button id="recordButton" onclick="showNameInput()">기록 입력</button>
            <button id="skipRecordButton" onclick="skipRecord()">기록 입력 생략</button>
        </div>
        <div id="nameInputSection" class="hidden">
            <p>이름을 입력하세요:</p>
            <input type="text" id="playerName" placeholder="이름 입력">
            <button id="saveButton" onclick="saveRecord()">기록 저장</button>
        </div>
    `;
    showScreen(resultScreen);
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



/** 게임 기록을 localStorage에 저장 & 리더보드 업데이트 */
function saveRecord() {
    let playerName = document.getElementById("playerName").value.trim() || "익명";
    let timeTaken = ((endTime - startTime) / 1000).toFixed(3);
    let storageKey = `leaderboard_${currentMode}`;

    // 기존 기록 불러오기
    let leaderboard = JSON.parse(localStorage.getItem(storageKey)) || [];
    leaderboard.push({ name: playerName, time: parseFloat(timeTaken) });

    // 시간 순으로 정렬 (최고 기록이 가장 위로)
    leaderboard.sort((a, b) => a.time - b.time);

    // 저장
    localStorage.setItem(storageKey, JSON.stringify(leaderboard));

    // Top 3 갱신
    updateTop3();
    
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

/** 현재 Top 3 랭커 표시 (순위 포함, '초'가 줄바꿈 없이 정상 위치) */
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

/** 기록 초기화 (Ctrl + B) */
document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === "b") {
        clearRecords();
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
