# Generated by Django 5.1.7 on 2025-05-30 16:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0033_alter_group_code_alter_notification_time_triggered'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='isAnswered',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.CharField(default='N5D0oSn077njsGUYlsIbsuPzWZtIxhbP', max_length=300),
        ),
    ]
