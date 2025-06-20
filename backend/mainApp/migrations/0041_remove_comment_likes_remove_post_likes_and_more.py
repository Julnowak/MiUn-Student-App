# Generated by Django 5.1.7 on 2025-06-03 16:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0040_alter_group_code'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='likes',
        ),
        migrations.RemoveField(
            model_name='post',
            name='likes',
        ),
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.CharField(default='wEE7xBWWu9YQkg7iPQE5SuqNsIzITGTr', max_length=300),
        ),
        migrations.CreateModel(
            name='LikePost',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('value', models.BooleanField(blank=True, null=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainApp.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('post', 'user')},
            },
        ),
        migrations.DeleteModel(
            name='Like',
        ),
    ]
