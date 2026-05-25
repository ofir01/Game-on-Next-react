(function () {

    // כתובת ה־API ששולחת את אירועי המשחק לשרת
    const ENDPOINT = '/api/game-session';

    // רשימת סוגי האירועים האפשריים במשחק
    const EVENTS = {
        STARTED: 'STARTED',
        FINISHED: 'FINISHED',
        ABORTED: 'ABORTED',
        PAUSED: 'PAUSED',
        RESUMED: 'RESUMED',
    };

    // ממיר את שם האירוע לאותיות גדולות כדי לשמור על אחידות
    const normalizeEvent = (event) => String(event || '').toUpperCase();

    // לוקח את ה־gameId מתוך ה־URL
    const getGameIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);

        const gameId = Number(params.get('gameId'));

        return Number.isInteger(gameId) && gameId > 0
            ? gameId
            : null;
    };

    // יוצר מפתח ייחודי לשמירה ב־sessionStorage
    const getSessionKey = (gameId) => `game-session:${gameId}`;

    // מחזיר sessionId שמור אם קיים
    const getStoredSessionId = (gameId) => {
        const sessionId = Number(
            window.sessionStorage.getItem(getSessionKey(gameId))
        );

        return Number.isInteger(sessionId) && sessionId > 0
            ? sessionId
            : undefined;
    };

    // שומר sessionId כדי להמשיך את אותה סשן
    const setStoredSessionId = (gameId, sessionId) => {
        if (!sessionId) return;

        window.sessionStorage.setItem(
            getSessionKey(gameId),
            String(sessionId)
        );
    };

    // מוחק sessionId לאחר סיום המשחק
    const clearStoredSessionId = (gameId) => {
        window.sessionStorage.removeItem(getSessionKey(gameId));
    };

    // בונה את המידע שנשלח לשרת
    const buildPayload = ({
        gameId,
        event,
        data = {},
        result,
        sessionId
    }) => {

        const safeGameId = Number(gameId || getGameIdFromUrl());

        // בדיקה שיש gameId תקין
        if (!Number.isInteger(safeGameId) || safeGameId <= 0) {
            throw new Error('gameId is required');
        }

        return {
            gameId: safeGameId,
            sessionId: sessionId || getStoredSessionId(safeGameId),
            event: normalizeEvent(event),
            data,
            result,
        };
    };

    // שולח אירוע רגיל לשרת באמצעות fetch
    const sendEvent = async (eventPayload) => {

        const payload = buildPayload(eventPayload);

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            credentials: 'same-origin',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(payload),
        });

        // ניסיון לקרוא תשובת JSON
        const responseBody = await response.json().catch(() => ({}));

        // אם השרת החזיר שגיאה
        if (!response.ok) {
            throw new Error(
                responseBody.message ||
                `Game event failed: ${response.status}`
            );
        }

        // אם נוצר session חדש שומרים אותו
        if (responseBody.data?.id) {
            setStoredSessionId(payload.gameId, responseBody.data.id);
        }

        // אם המשחק הסתיים או בוטל מוחקים session
        if ([EVENTS.FINISHED, EVENTS.ABORTED].includes(payload.event)) {
            clearStoredSessionId(payload.gameId);
        }

        return responseBody;
    };

    // שליחה מהירה לפני סגירת הטאב
    const sendBeaconEvent = (eventPayload) => {

        // בדיקה שהדפדפן תומך
        if (!navigator.sendBeacon) {
            return false;
        }

        const payload = buildPayload(eventPayload);

        const ok = navigator.sendBeacon(
            ENDPOINT,

            new Blob(
                [JSON.stringify(payload)],
                { type: 'application/json' }
            )
        );

        // ניקוי session אם המשחק נסגר
        if (
            ok &&
            [EVENTS.FINISHED, EVENTS.ABORTED].includes(payload.event)
        ) {
            clearStoredSessionId(payload.gameId);
        }

        return ok;
    };

    // יוצר tracker שמנהל את מצב המשחק
    const createTracker = ({
        gameId,
        getData = () => ({}),
        autoStart = true,
        autoAbort = true
    } = {}) => {

        const safeGameId = Number(gameId || getGameIdFromUrl());

        let isClosed = true;
        let isClosing = false;

        // מחזיר נתונים מעודכנים מהמשחק
        const readData = (data) => {

            // אם נשלחו נתונים ידנית
            if (data !== undefined) {
                return data;
            }

            const value = getData();

            // מחזיר רק אובייקט תקין
            return (
                value &&
                typeof value === 'object' &&
                !Array.isArray(value)
            )
                ? value
                : {};
        };

        // פונקציה פנימית לשליחת אירועי משחק
        const sendGameEvent = (event, { data, result } = {}) => {

            const safeEvent = normalizeEvent(event);

            const payload = {
                gameId: safeGameId,
                event: safeEvent,
                data: readData(data),
                result,
            };

            // במקרה של יציאה מהמשחק משתמשים ב־Beacon
            if (safeEvent === EVENTS.ABORTED) {

                sendBeaconEvent(payload);

                isClosed = true;

                return Promise.resolve();
            }

            return sendEvent(payload);
        };

        // התחלת משחק
        const start = (data) => {

            isClosed = false;
            isClosing = false;

            return sendGameEvent(EVENTS.STARTED, { data });
        };

        // סיום משחק
        const finish = (result, data) => {

            // מונע שליחה כפולה
            if (isClosing) {
                return Promise.resolve(null);
            }

            isClosing = true;

            return sendGameEvent(EVENTS.FINISHED, {
                result,
                data
            }).finally(() => {

                isClosed = true;
                isClosing = false;
            });
        };

        // ביטול משחק
        const abort = (data) => {

            if (isClosed) {
                return Promise.resolve(null);
            }

            isClosed = true;

            return sendGameEvent(EVENTS.ABORTED, { data });
        };

        // שולח abort אוטומטי כשסוגרים את הדף
        if (autoAbort) {

            window.addEventListener('beforeunload', () => {
                abort();
            });
        }

        // מתחיל משחק אוטומטית
        if (autoStart) {
            start();
        }

        // מחזיר את פונקציות הניהול
        return {
            start,
            finish,
            abort,
            sendEvent: sendGameEvent,

            isClosed: () => isClosed,

            isClosing: () => isClosing,
        };
    };

    // חשיפת הפונקציות לשימוש חיצוני
    window.GameSessionEvents = {
        EVENTS,
        sendEvent,
        sendBeaconEvent,
        createTracker,
        createActions: createTracker,
        getGameId: getGameIdFromUrl,
    };

})();


//=======================================================================================
//יצירת מידע לטבלת DB
//=======================================================================================

let gameSessionActions;



async function finishGameSession(result) {
    if (gameSessionActions?.isClosing()) return;

    return gameSessionActions
        ? gameSessionActions.finish(result)
        : Promise.resolve();
}

/*


<script src="../CandyCrush/game-session-events.js"></script>
<script src="JS.js"></script>


בתוך window.onload או פונקציית ההתחלה של המשחק:
document.addEventListener('DOMContentLoaded', () => {
 gameSessionActions = window.GameSessionEvents?.createActions({
        getData: () => getGameSessionData(score, goalCount, attemptsCount),
    });
});
זה כבר שולח STARTED לבד, וגם ABORTED בסגירת דף.

במקום שבו המשחק מסתיים בניצחון:
await gameSessionActions?.finish('win');
במקום שבו המשחק מסתיים בהפסד:
await gameSessionActions?.finish('loss');
אם אחרי סיום המשחק אתה מאפס ומתחיל סיבוב חדש באותו דף:

await gameSessionActions?.finish('win');
resetGame();
gameSessionActions?.start();



*/