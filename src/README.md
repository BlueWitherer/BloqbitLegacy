# <img src="../icon.ico" width="25" alt="Logo" /> Bloqbit
Need it? Got it.

---

### Development
###### Work with the bot directly.

Bloqbit is open-source. You may take its source code directly and modify it to fit your own needs. First, let's start by defining our environment variables. These are used to store sensitive data such as tokens.

| Variable              | Description                                                       | Required  |
|:---------------------:|-------------------------------------------------------------------|:---------:|
| **`MAIN_TOKEN`**      | Token for the bot of the Discord application you will utilize.    | **`Yes`** |
| **`MAIN_SECRET`**     | The application's secret.                                         | `No`      |
| **`MAIN_LOG_WH`**     | URL for the webhook used to log important bot events.             | **`Yes`** |
| **`MONGO_URI`**       | URI to access your [MongoDB](https://www.mongodb.com/) database.  | **`Yes`** |
| `AI_TOKEN`            | [Groqcloud](https://www.groq.com/groqcloud/) API token.           | `No`      |

> [!NOTE]
> Some variables have a testing counterpart, where they access a dummy model just for testing.
>
> | Variable                | Tests For             |
> |:-----------------------:|:---------------------:|
> | `TEST_TOKEN`            | `MAIN_TOKEN`          |
> | `TEST_SECRET`           | `MAIN_SECRET`         |
> | `TEST_LOG_WH`           | `MAIN_LOG_WH`         |

---

### Deployment
###### Set up your own server instance of Bloqbit!
**[🔌 Get the eggs](https://www.github.com/CubicCommunity/bloqbit-eggs/)**

*More coming soon...*