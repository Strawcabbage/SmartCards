CREATE TABLE Sets (
    ID int not null AUTO_INCREMENT,
    LIST_NAME varchar(50) not null,
    USER_NAME varchar(50) not null,
    PRIMARY KEY (ID)
)

CREATE TABLE Flashcards (
    ID int NOT NULL AUTO_INCREMENT,
    SET_ID int NOT NULL,
    KEY varchar(50) NOT NULL,
    DEFINITION varchar(500) NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (SET_ID) REFERENCES Sets(ID) ON DELETE CASCADE
);